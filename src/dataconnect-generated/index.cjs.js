const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'frontend',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const listJobApplicationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListJobApplications');
}
listJobApplicationsRef.operationName = 'ListJobApplications';
exports.listJobApplicationsRef = listJobApplicationsRef;

exports.listJobApplications = function listJobApplications(dc) {
  return executeQuery(listJobApplicationsRef(dc));
};

const createDocumentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateDocument', inputVars);
}
createDocumentRef.operationName = 'CreateDocument';
exports.createDocumentRef = createDocumentRef;

exports.createDocument = function createDocument(dcOrVars, vars) {
  return executeMutation(createDocumentRef(dcOrVars, vars));
};

const getUserRemindersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserReminders');
}
getUserRemindersRef.operationName = 'GetUserReminders';
exports.getUserRemindersRef = getUserRemindersRef;

exports.getUserReminders = function getUserReminders(dc) {
  return executeQuery(getUserRemindersRef(dc));
};

const updateJobApplicationStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateJobApplicationStatus', inputVars);
}
updateJobApplicationStatusRef.operationName = 'UpdateJobApplicationStatus';
exports.updateJobApplicationStatusRef = updateJobApplicationStatusRef;

exports.updateJobApplicationStatus = function updateJobApplicationStatus(dcOrVars, vars) {
  return executeMutation(updateJobApplicationStatusRef(dcOrVars, vars));
};
