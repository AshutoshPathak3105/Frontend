import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AIRequest_Key {
  id: UUIDString;
  __typename?: 'AIRequest_Key';
}

export interface CreateDocumentData {
  document_insert: Document_Key;
}

export interface CreateDocumentVariables {
  name: string;
  type: string;
  content: string;
}

export interface Document_Key {
  id: UUIDString;
  __typename?: 'Document_Key';
}

export interface GetUserRemindersData {
  reminders: ({
    id: UUIDString;
    title: string;
    dueDate: TimestampString;
    status: string;
    jobApplication?: {
      jobTitle: string;
      companyName: string;
    };
  } & Reminder_Key)[];
}

export interface JobApplication_Key {
  id: UUIDString;
  __typename?: 'JobApplication_Key';
}

export interface ListJobApplicationsData {
  jobApplications: ({
    id: UUIDString;
    jobTitle: string;
    companyName: string;
    applicationDate: DateString;
    status: string;
    jobLink?: string | null;
  } & JobApplication_Key)[];
}

export interface Reminder_Key {
  id: UUIDString;
  __typename?: 'Reminder_Key';
}

export interface UpdateJobApplicationStatusData {
  jobApplication_update?: JobApplication_Key | null;
}

export interface UpdateJobApplicationStatusVariables {
  id: UUIDString;
  status: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface ListJobApplicationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListJobApplicationsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListJobApplicationsData, undefined>;
  operationName: string;
}
export const listJobApplicationsRef: ListJobApplicationsRef;

export function listJobApplications(): QueryPromise<ListJobApplicationsData, undefined>;
export function listJobApplications(dc: DataConnect): QueryPromise<ListJobApplicationsData, undefined>;

interface CreateDocumentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateDocumentVariables): MutationRef<CreateDocumentData, CreateDocumentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateDocumentVariables): MutationRef<CreateDocumentData, CreateDocumentVariables>;
  operationName: string;
}
export const createDocumentRef: CreateDocumentRef;

export function createDocument(vars: CreateDocumentVariables): MutationPromise<CreateDocumentData, CreateDocumentVariables>;
export function createDocument(dc: DataConnect, vars: CreateDocumentVariables): MutationPromise<CreateDocumentData, CreateDocumentVariables>;

interface GetUserRemindersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserRemindersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetUserRemindersData, undefined>;
  operationName: string;
}
export const getUserRemindersRef: GetUserRemindersRef;

export function getUserReminders(): QueryPromise<GetUserRemindersData, undefined>;
export function getUserReminders(dc: DataConnect): QueryPromise<GetUserRemindersData, undefined>;

interface UpdateJobApplicationStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateJobApplicationStatusVariables): MutationRef<UpdateJobApplicationStatusData, UpdateJobApplicationStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateJobApplicationStatusVariables): MutationRef<UpdateJobApplicationStatusData, UpdateJobApplicationStatusVariables>;
  operationName: string;
}
export const updateJobApplicationStatusRef: UpdateJobApplicationStatusRef;

export function updateJobApplicationStatus(vars: UpdateJobApplicationStatusVariables): MutationPromise<UpdateJobApplicationStatusData, UpdateJobApplicationStatusVariables>;
export function updateJobApplicationStatus(dc: DataConnect, vars: UpdateJobApplicationStatusVariables): MutationPromise<UpdateJobApplicationStatusData, UpdateJobApplicationStatusVariables>;

