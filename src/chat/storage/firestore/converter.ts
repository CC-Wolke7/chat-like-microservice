import { Timestamp } from '@google-cloud/firestore';
import {
  FirestoreChatMessageModel,
  FirestoreChatModel,
} from './firestore-chat.storage';

type InternalFirestoreChatModel = FirestoreChatModel;

type InternalFirestoreChatMessageModel = Omit<
  FirestoreChatMessageModel,
  'date'
> & {
  date: FirebaseFirestore.Timestamp;
};

export const ChatConverter: FirebaseFirestore.FirestoreDataConverter<FirestoreChatModel> = {
  toFirestore: (
    model: FirestoreChatModel,
    options?: FirebaseFirestore.SetOptions,
  ): InternalFirestoreChatModel => {
    return model;
  },

  fromFirestore: (
    snapshot: FirebaseFirestore.QueryDocumentSnapshot,
  ): FirestoreChatModel => {
    const internalModel = snapshot.data() as InternalFirestoreChatModel;

    return internalModel;
  },
};

export const MessageConverter: FirebaseFirestore.FirestoreDataConverter<FirestoreChatMessageModel> = {
  toFirestore: (
    model: FirestoreChatMessageModel,
    options?: FirebaseFirestore.SetOptions,
  ): InternalFirestoreChatMessageModel => {
    return {
      ...model,
      date: Timestamp.fromDate(model.date),
    };
  },

  fromFirestore: (
    snapshot: FirebaseFirestore.QueryDocumentSnapshot,
  ): FirestoreChatMessageModel => {
    const internalModel = snapshot.data() as InternalFirestoreChatMessageModel;

    return {
      ...internalModel,
      date: internalModel.date.toDate(),
    };
  },
};
