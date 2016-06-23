#Formality

React forms with courtesy.

## Introduction

Formality aims to be a simple and composable library for validated input and forms in React. The provided input components can be used without any parent container, and can be interacted with like a standard component via `onChange`.

Alternatively your inputs can be wrapped in a `<Form />` component which will retrieve all data and pass it to the `onSubmit` event handler- which is only fired when all input is valid (unless you pass `submitOnInvalid`)!. 

### Simple validation

Validation is done by passing validation functions as children to an Input component. This method is inspired by the [validation library by vacuumlabs](https://github.com/vacuumlabs/validation) ([Video](https://www.youtube.com/watch?v=FqscLiODo5c)].

## Usage

### Standard validation with debounce

```javascript
import { Input, isEmail } from "@thinmartian/formality";

<Input debounce={300} name="email">
    <IsEmail />
</Input>
```
    
### Validation with message override

```javascript
import { Input, Required } from "@thinmartian/formality";

<Input name="username">
    <Required message="Please supply a username" />
</Input>
```

### Async validation

```javascript
const AsyncCheck = ({ value }) => {
    return new Promise(resolve => {
        setTimeout(() => resolve(value === "correct"), 1000);
    });
}
// Uncomment to mark validation as asynchronous
// it will be treated as async without executing the promise
// AsyncCheck.async = true;

import { Input, Required } from "@thinmartian/formality";

<Input name="server_check">
    <Required />
    <AsyncCheck />
</Input>
```

### Creating a validator (manual)

```javascript
const MyCustomValidator = ({ value, is /* props */}) => {
    // Can return a boolean, message will be loaded from props or parent Input
    // return value === is; 
    return {
        vaiid: value === is,
        message: `Value does not equal ${is}`,
        key: "equal"
    }
}

// Usage
<MyCustomValidator is="matched" />
```

### Creating a validator (from a boolean function via compose)

```javascript
import { compose } from "@thinmartian/formality"
import isAlpha from "validator/lib/isAlpha"

const IsAlpha = compose(
    isAlpha,
    "Please enter an alphabetical string only",
    "alpha"
)

// Usage
<IsAlpha />
```

## Examples

Please see the `examples/` directory for example usage of components


## More Documentation Coming Soon!
