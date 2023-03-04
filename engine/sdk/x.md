# (workflow)

---

# Sub Schemas

The schema defines the following additional types:

## `workflow` (object)

A workflow.

Properties of the `workflow` object:

### `assets` (array)

Custom assets used in this workflow.  These override or augment the default assets provided by the SDK.

The object is an array with all elements of the type `object`.

The array object has the following properties:

#### `symbol` (string, required)

#### `name` (string)

#### `iconUrl` (string)

#### `chains` (object, required)

### `steps` (array, required)

The set of steps for this workflow.  Execution will begin at the step at index 0.

The elements of the array must match *at least one* of the following properties:

### (object)

Properties of the `undefined` object:

#### `id` (string)

#### `nextStepId` (string)

Additional restrictions:

* Regex pattern: `^[^\s]*$`

#### `outputAssets` (array, required)

The object is an array with all elements of the type `string`.

#### `type` (string, required)

### (object)

Properties of the `undefined` object:

#### `id`

#### `nextStepId`

#### `inputAssets` (array, required)

The object is an array with all elements of the type `object`.

The array object has the following properties:

##### `symbol` (string, required)

##### `amount` (, required)

##### `amountIsPercent` (boolean, required)

#### `type` (string, required)

#### `maxSlippagePercent` (number, required)

#### `destinationChain` (string, enum, required)

This element must be one of the following enum values:

* `ethereum`
* `arbitrum`
* `avalanche`
* `polygon`
* `binance`
* `optimism`
* `fantom`

#### `destinationGas`

#### `destinationUserAddress` (, required)
