import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'frontend',
  location: 'us-east4'
};

export const listJobApplicationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListJobApplications');
}
listJobApplicationsRef.operationName = 'ListJobApplications';

export function listJobApplications(dc) {
  return executeQuery(listJobApplicationsRef(dc));
}

export const createDocumentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateDocument', inputVars);
}
createDocumentRef.operationName = 'CreateDocument';

export function createDocument(dcOrVars, vars) {
  return executeMutation(createDocumentRef(dcOrVars, vars));
}

export const getUserRemindersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserReminders');
}
getUserRemindersRef.operationName = 'GetUserReminders';

export function getUserReminders(dc) {
  return executeQuery(getUserRemindersRef(dc));
}

export const updateJobApplicationStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateJobApplicationStatus', inputVars);
}
updateJobApplicationStatusRef.operationName = 'UpdateJobApplicationStatus';

export function updateJobApplicationStatus(dcOrVars, vars) {
  return executeMutation(updateJobApplicationStatusRef(dcOrVars, vars));
}

