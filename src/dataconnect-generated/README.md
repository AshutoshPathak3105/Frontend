# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListJobApplications*](#listjobapplications)
  - [*GetUserReminders*](#getuserreminders)
- [**Mutations**](#mutations)
  - [*CreateDocument*](#createdocument)
  - [*UpdateJobApplicationStatus*](#updatejobapplicationstatus)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListJobApplications
You can execute the `ListJobApplications` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listJobApplications(): QueryPromise<ListJobApplicationsData, undefined>;

interface ListJobApplicationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListJobApplicationsData, undefined>;
}
export const listJobApplicationsRef: ListJobApplicationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listJobApplications(dc: DataConnect): QueryPromise<ListJobApplicationsData, undefined>;

interface ListJobApplicationsRef {
  ...
  (dc: DataConnect): QueryRef<ListJobApplicationsData, undefined>;
}
export const listJobApplicationsRef: ListJobApplicationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listJobApplicationsRef:
```typescript
const name = listJobApplicationsRef.operationName;
console.log(name);
```

### Variables
The `ListJobApplications` query has no variables.
### Return Type
Recall that executing the `ListJobApplications` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListJobApplicationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListJobApplications`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listJobApplications } from '@dataconnect/generated';


// Call the `listJobApplications()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listJobApplications();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listJobApplications(dataConnect);

console.log(data.jobApplications);

// Or, you can use the `Promise` API.
listJobApplications().then((response) => {
  const data = response.data;
  console.log(data.jobApplications);
});
```

### Using `ListJobApplications`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listJobApplicationsRef } from '@dataconnect/generated';


// Call the `listJobApplicationsRef()` function to get a reference to the query.
const ref = listJobApplicationsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listJobApplicationsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.jobApplications);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.jobApplications);
});
```

## GetUserReminders
You can execute the `GetUserReminders` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserReminders(): QueryPromise<GetUserRemindersData, undefined>;

interface GetUserRemindersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserRemindersData, undefined>;
}
export const getUserRemindersRef: GetUserRemindersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserReminders(dc: DataConnect): QueryPromise<GetUserRemindersData, undefined>;

interface GetUserRemindersRef {
  ...
  (dc: DataConnect): QueryRef<GetUserRemindersData, undefined>;
}
export const getUserRemindersRef: GetUserRemindersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserRemindersRef:
```typescript
const name = getUserRemindersRef.operationName;
console.log(name);
```

### Variables
The `GetUserReminders` query has no variables.
### Return Type
Recall that executing the `GetUserReminders` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserRemindersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetUserReminders`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserReminders } from '@dataconnect/generated';


// Call the `getUserReminders()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserReminders();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserReminders(dataConnect);

console.log(data.reminders);

// Or, you can use the `Promise` API.
getUserReminders().then((response) => {
  const data = response.data;
  console.log(data.reminders);
});
```

### Using `GetUserReminders`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserRemindersRef } from '@dataconnect/generated';


// Call the `getUserRemindersRef()` function to get a reference to the query.
const ref = getUserRemindersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserRemindersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.reminders);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.reminders);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateDocument
You can execute the `CreateDocument` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createDocument(vars: CreateDocumentVariables): MutationPromise<CreateDocumentData, CreateDocumentVariables>;

interface CreateDocumentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateDocumentVariables): MutationRef<CreateDocumentData, CreateDocumentVariables>;
}
export const createDocumentRef: CreateDocumentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createDocument(dc: DataConnect, vars: CreateDocumentVariables): MutationPromise<CreateDocumentData, CreateDocumentVariables>;

interface CreateDocumentRef {
  ...
  (dc: DataConnect, vars: CreateDocumentVariables): MutationRef<CreateDocumentData, CreateDocumentVariables>;
}
export const createDocumentRef: CreateDocumentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createDocumentRef:
```typescript
const name = createDocumentRef.operationName;
console.log(name);
```

### Variables
The `CreateDocument` mutation requires an argument of type `CreateDocumentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateDocumentVariables {
  name: string;
  type: string;
  content: string;
}
```
### Return Type
Recall that executing the `CreateDocument` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateDocumentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateDocumentData {
  document_insert: Document_Key;
}
```
### Using `CreateDocument`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createDocument, CreateDocumentVariables } from '@dataconnect/generated';

// The `CreateDocument` mutation requires an argument of type `CreateDocumentVariables`:
const createDocumentVars: CreateDocumentVariables = {
  name: ..., 
  type: ..., 
  content: ..., 
};

// Call the `createDocument()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createDocument(createDocumentVars);
// Variables can be defined inline as well.
const { data } = await createDocument({ name: ..., type: ..., content: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createDocument(dataConnect, createDocumentVars);

console.log(data.document_insert);

// Or, you can use the `Promise` API.
createDocument(createDocumentVars).then((response) => {
  const data = response.data;
  console.log(data.document_insert);
});
```

### Using `CreateDocument`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createDocumentRef, CreateDocumentVariables } from '@dataconnect/generated';

// The `CreateDocument` mutation requires an argument of type `CreateDocumentVariables`:
const createDocumentVars: CreateDocumentVariables = {
  name: ..., 
  type: ..., 
  content: ..., 
};

// Call the `createDocumentRef()` function to get a reference to the mutation.
const ref = createDocumentRef(createDocumentVars);
// Variables can be defined inline as well.
const ref = createDocumentRef({ name: ..., type: ..., content: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createDocumentRef(dataConnect, createDocumentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.document_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.document_insert);
});
```

## UpdateJobApplicationStatus
You can execute the `UpdateJobApplicationStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateJobApplicationStatus(vars: UpdateJobApplicationStatusVariables): MutationPromise<UpdateJobApplicationStatusData, UpdateJobApplicationStatusVariables>;

interface UpdateJobApplicationStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateJobApplicationStatusVariables): MutationRef<UpdateJobApplicationStatusData, UpdateJobApplicationStatusVariables>;
}
export const updateJobApplicationStatusRef: UpdateJobApplicationStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateJobApplicationStatus(dc: DataConnect, vars: UpdateJobApplicationStatusVariables): MutationPromise<UpdateJobApplicationStatusData, UpdateJobApplicationStatusVariables>;

interface UpdateJobApplicationStatusRef {
  ...
  (dc: DataConnect, vars: UpdateJobApplicationStatusVariables): MutationRef<UpdateJobApplicationStatusData, UpdateJobApplicationStatusVariables>;
}
export const updateJobApplicationStatusRef: UpdateJobApplicationStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateJobApplicationStatusRef:
```typescript
const name = updateJobApplicationStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateJobApplicationStatus` mutation requires an argument of type `UpdateJobApplicationStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateJobApplicationStatusVariables {
  id: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateJobApplicationStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateJobApplicationStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateJobApplicationStatusData {
  jobApplication_update?: JobApplication_Key | null;
}
```
### Using `UpdateJobApplicationStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateJobApplicationStatus, UpdateJobApplicationStatusVariables } from '@dataconnect/generated';

// The `UpdateJobApplicationStatus` mutation requires an argument of type `UpdateJobApplicationStatusVariables`:
const updateJobApplicationStatusVars: UpdateJobApplicationStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateJobApplicationStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateJobApplicationStatus(updateJobApplicationStatusVars);
// Variables can be defined inline as well.
const { data } = await updateJobApplicationStatus({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateJobApplicationStatus(dataConnect, updateJobApplicationStatusVars);

console.log(data.jobApplication_update);

// Or, you can use the `Promise` API.
updateJobApplicationStatus(updateJobApplicationStatusVars).then((response) => {
  const data = response.data;
  console.log(data.jobApplication_update);
});
```

### Using `UpdateJobApplicationStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateJobApplicationStatusRef, UpdateJobApplicationStatusVariables } from '@dataconnect/generated';

// The `UpdateJobApplicationStatus` mutation requires an argument of type `UpdateJobApplicationStatusVariables`:
const updateJobApplicationStatusVars: UpdateJobApplicationStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateJobApplicationStatusRef()` function to get a reference to the mutation.
const ref = updateJobApplicationStatusRef(updateJobApplicationStatusVars);
// Variables can be defined inline as well.
const ref = updateJobApplicationStatusRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateJobApplicationStatusRef(dataConnect, updateJobApplicationStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.jobApplication_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.jobApplication_update);
});
```

