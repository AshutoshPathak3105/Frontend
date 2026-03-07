import { ListJobApplicationsData, CreateDocumentData, CreateDocumentVariables, GetUserRemindersData, UpdateJobApplicationStatusData, UpdateJobApplicationStatusVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListJobApplications(options?: useDataConnectQueryOptions<ListJobApplicationsData>): UseDataConnectQueryResult<ListJobApplicationsData, undefined>;
export function useListJobApplications(dc: DataConnect, options?: useDataConnectQueryOptions<ListJobApplicationsData>): UseDataConnectQueryResult<ListJobApplicationsData, undefined>;

export function useCreateDocument(options?: useDataConnectMutationOptions<CreateDocumentData, FirebaseError, CreateDocumentVariables>): UseDataConnectMutationResult<CreateDocumentData, CreateDocumentVariables>;
export function useCreateDocument(dc: DataConnect, options?: useDataConnectMutationOptions<CreateDocumentData, FirebaseError, CreateDocumentVariables>): UseDataConnectMutationResult<CreateDocumentData, CreateDocumentVariables>;

export function useGetUserReminders(options?: useDataConnectQueryOptions<GetUserRemindersData>): UseDataConnectQueryResult<GetUserRemindersData, undefined>;
export function useGetUserReminders(dc: DataConnect, options?: useDataConnectQueryOptions<GetUserRemindersData>): UseDataConnectQueryResult<GetUserRemindersData, undefined>;

export function useUpdateJobApplicationStatus(options?: useDataConnectMutationOptions<UpdateJobApplicationStatusData, FirebaseError, UpdateJobApplicationStatusVariables>): UseDataConnectMutationResult<UpdateJobApplicationStatusData, UpdateJobApplicationStatusVariables>;
export function useUpdateJobApplicationStatus(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateJobApplicationStatusData, FirebaseError, UpdateJobApplicationStatusVariables>): UseDataConnectMutationResult<UpdateJobApplicationStatusData, UpdateJobApplicationStatusVariables>;
