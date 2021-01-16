import { Inject, Injectable } from '@nestjs/common';
import {
  ChatStorageProvider,
  ChatModel,
  ChatMessageModel,
  ChatUUID,
  ChatMessageUUID,
  UserUUID,
  ChatPrototype,
  ChatMessagePrototype,
} from '../../interfaces/storage';
import { Firestore } from '@google-cloud/firestore';
import * as crypto from 'crypto';
import { ChatConverter, MessageConverter } from './firestore-chat-converter';
import {
  ChatConfig,
  ChatConfigProvider,
} from '../../../app/config/chat.config';
import {
  CoreConfig,
  CoreConfigProvider,
} from '../../../app/config/core.config';

export type FirestoreChatModel = Omit<ChatModel, 'uuid'> & {
  participantsHash: string;
};

export type FirestoreChatMessageModel = Omit<ChatMessageModel, 'uuid'>;

enum FirestoreCollectionPath {
  Chats = 'chats',
  Messages = 'messages',
}

@Injectable()
export class FirestoreChatStorage implements ChatStorageProvider {
  // MARK: - Private Properties
  private readonly firestore: Firestore;

  private readonly chats: FirebaseFirestore.CollectionReference<FirestoreChatModel>;
  private readonly messages: FirebaseFirestore.CollectionReference<FirestoreChatMessageModel>;

  // MARK: - Initialization
  constructor(
    @Inject(CoreConfig.KEY) config: CoreConfigProvider,
    @Inject(ChatConfig.KEY) { database }: ChatConfigProvider,
  ) {
    this.firestore = new Firestore({
      projectId: config.gcp.projectId,
      host: database?.host,
      port: database?.port,
    });

    this.chats = this.firestore
      .collection(FirestoreCollectionPath.Chats)
      .withConverter(ChatConverter);

    this.messages = this.firestore
      .collection(FirestoreCollectionPath.Messages)
      .withConverter(MessageConverter);
  }

  // MARK: - Public Methods
  async reset(): Promise<void> {
    const chatDocumentRefs = await this.chats.listDocuments();
    await Promise.all(
      chatDocumentRefs.map((chatDocument) => chatDocument.delete()),
    );

    const messageDocumentRefs = await this.messages.listDocuments();
    await Promise.all(
      messageDocumentRefs.map((messageDocument) => messageDocument.delete()),
    );
  }

  closeConnection(): Promise<void> {
    return this.firestore.terminate();
  }

  // MARK: Chat
  async getChat(uuid: ChatUUID): Promise<ChatModel | undefined> {
    return this.toChat(await this.chats.doc(uuid).get());
  }

  async createChat(prototype: ChatPrototype): Promise<ChatModel> {
    const model: FirestoreChatModel = {
      ...prototype,
      participantsHash: this.getParticipantHash(
        new Set(prototype.participants),
      ),
    };

    const chatDocumentRef = await this.chats.add(model);

    return {
      ...prototype,
      uuid: chatDocumentRef.id,
    };
  }

  async findChatsByParticipants(
    participants: Set<UserUUID>,
    strictEqual: boolean,
  ): Promise<ChatModel[]> {
    if (strictEqual) {
      const participantsHash = this.getParticipantHash(participants);

      const chatDocumentsSnapshot = await this.chats
        .where('participantsHash', '==', participantsHash)
        .get();

      return chatDocumentsSnapshot.docs.map(
        (chatDocument) => this.toChat(chatDocument)!,
      );
    } else {
      const chatDocumentsSnapshot = await this.chats
        .where('participants', 'array-contains-any', Array.from(participants))
        .get();

      return chatDocumentsSnapshot.docs
        .map((chatDocument) => this.toChat(chatDocument)!)
        .filter((chat) =>
          Array.from(participants).every((participant) =>
            chat.participants.includes(participant),
          ),
        );
    }
  }

  // MARK: Chat
  async getMessage(
    uuid: ChatMessageUUID,
  ): Promise<ChatMessageModel | undefined> {
    return this.toMessage(await this.messages.doc(uuid).get());
  }

  async createMessage(
    prototype: ChatMessagePrototype,
  ): Promise<ChatMessageModel> {
    const model: FirestoreChatMessageModel = {
      ...prototype,
    };

    const messageDocumentRef = await this.messages.add(model);

    return {
      ...prototype,
      uuid: messageDocumentRef.id,
    };
  }

  async findMessagesByChat(chat: ChatUUID): Promise<ChatMessageModel[]> {
    const messageDocumentsSnapshot = await this.messages
      .where('chat', '==', chat)
      .get();

    return messageDocumentsSnapshot.docs.map((doc) => this.toMessage(doc)!);
  }

  // MARK: - Private Methods
  private getParticipantHash(participants: Set<UserUUID>): string {
    const orderedParticipats = Array.from(participants).sort((a, b) =>
      a.localeCompare(b),
    );

    return crypto
      .createHash('sha256')
      .update(orderedParticipats.join(','))
      .digest('hex');
  }

  // MARK: Chat
  private toChat(
    document: FirebaseFirestore.DocumentSnapshot<FirestoreChatModel>,
  ): ChatModel | undefined {
    if (!document.exists) {
      return undefined;
    }

    const model = document.data()!;

    return {
      uuid: document.id,
      creator: model.creator,
      participants: model.participants,
    };
  }

  // MARK: Message
  private toMessage(
    document: FirebaseFirestore.DocumentSnapshot<FirestoreChatMessageModel>,
  ): ChatMessageModel | undefined {
    if (!document.exists) {
      return undefined;
    }

    const model = document.data()!;

    return {
      uuid: document.id,
      chat: model.chat,
      sender: model.sender,
      date: model.date,
      body: model.body,
    };
  }
}
