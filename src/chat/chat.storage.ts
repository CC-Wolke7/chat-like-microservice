import { Injectable } from '@nestjs/common';
import {
  ChatStorageProvider,
  ChatModel,
  ChatMessageModel,
  ChatUUID,
  ChatMessageUUID,
  UserUUID,
  ChatPrototype,
  ChatMessagePrototype,
} from './interfaces/storage';
import { Firestore } from '@google-cloud/firestore';
import * as crypto from 'crypto';

type FirestoreChatModel = Omit<
  ChatModel & {
    participantsHash: string;
  },
  'uuid'
>;

type FirestoreChatMessageModel = Omit<ChatMessageModel, 'uuid'>;

enum FirestoreCollectionPath {
  Chats = 'chats',
  Messages = 'messages',
}

@Injectable()
export class FirestoreChatStorage implements ChatStorageProvider {
  // MARK: - Private Properties
  private readonly firestore = new Firestore();

  private readonly chats = this.firestore.collection(
    FirestoreCollectionPath.Chats,
  );

  private readonly messages = this.firestore.collection(
    FirestoreCollectionPath.Messages,
  );

  // MARK: - Public Methods
  async reset(): Promise<void> {
    const chatDocuments = await this.chats.listDocuments();
    await Promise.all(
      chatDocuments.map((chatDocument) => chatDocument.delete()),
    );

    const messageDocuments = await this.messages.listDocuments();
    await Promise.all(
      messageDocuments.map((messageDocument) => messageDocument.delete()),
    );
  }

  closeConnection(): Promise<void> {
    return this.firestore.terminate();
  }

  // MARK: Chat
  async getChat(uuid: ChatUUID): Promise<ChatModel | undefined> {
    const chatDocument = await this.chats.doc(uuid).get();

    if (!chatDocument.exists) {
      return undefined;
    }

    return this.deserializeChat(chatDocument);
  }

  async createChat(prototype: ChatPrototype): Promise<ChatModel> {
    const participantsHash = this.getParticipantHash(
      new Set(prototype.participants),
    );

    const model: FirestoreChatModel = {
      ...prototype,
      participantsHash,
    };

    const chatDocument = await this.chats.add(model);

    return {
      ...prototype,
      uuid: chatDocument.id,
    };
  }

  async findChatsByParticipants(
    participants: Set<UserUUID>,
    strictEqual: boolean,
  ): Promise<ChatModel[]> {
    if (strictEqual) {
      const participantsHash = this.getParticipantHash(participants);

      const chatDocumentsRef = await this.chats
        .where('participantsHash', '==', participantsHash)
        .get();

      return chatDocumentsRef.docs.map((chatDocument) =>
        this.deserializeChat(chatDocument),
      );
    } else {
      const chatDocumentsRef = await this.chats
        .where('participants', 'array-contains-any', Array.from(participants))
        .get();

      return chatDocumentsRef.docs
        .map((chatDocument) => this.deserializeChat(chatDocument))
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
    const messageDocument = await this.messages.doc(uuid).get();

    if (!messageDocument.exists) {
      return undefined;
    }

    return this.deserializeMessage(messageDocument);
  }

  async createMessage(
    prototype: ChatMessagePrototype,
  ): Promise<ChatMessageModel> {
    const model: FirestoreChatMessageModel = {
      ...prototype,
    };

    const messageDocument = await this.messages.add(model);

    return {
      ...prototype,
      uuid: messageDocument.id,
    };
  }

  async findMessagesByChat(chat: ChatUUID): Promise<ChatMessageModel[]> {
    const messageDocumentsRef = await this.messages
      .where('chat', '==', chat)
      .get();

    return messageDocumentsRef.docs.map((doc) => this.deserializeMessage(doc));
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
  // @TODO: de/serialize date objects
  // @TODO: filter out non Chat(Message)Model fields
  private deserializeChat(
    document: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>,
  ): ChatModel {
    return {
      ...(document.data() as FirestoreChatModel),
      uuid: document.id,
    };
  }

  // MARK: Message
  private deserializeMessage(
    document: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>,
  ): ChatMessageModel {
    return {
      ...(document.data() as FirestoreChatMessageModel),
      uuid: document.id,
    };
  }
}
