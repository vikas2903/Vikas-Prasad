
// 1. Basic Types and Type Inference

let thisString: string = "Hello, TypeScript!";
let thisNumber: number = 42;
let thisBoolean: boolean = true;
let thisArray: number[] = [1, 2, 3, 4, 5];

let thisTuple: [string, number] = ["Age", 30];

let thisEnum: { [key: string]: number } = {
    Red: 0,
    Green: 1,
    Blue: 2
};

let thisAny: any = "I can be anything!";
let thisVoid: void = undefined;
let thisNull: null = null;
let thisUndefined: undefined = undefined;
let thisNever: never;
let thisObject: object = { name: "TypeScript", "version": "6.0.3" };
let thisSymbol: symbol = Symbol("unique");
let thisBigInt: bigint = 9007199254740991n;
let thisUnknown: unknown = "I am unknown";
let thisLiteral: "TypeScript" = "TypeScript";
let thisUnion: string | number = "I can be a string or a number";
let thisIntersection: { name: string } & { age: number } = { name: "TypeScript", age: 6 };
let thisFunction: (x: number, y: number) => number = (x, y) => x + y;
let thisClass: { new(name: string): { name: string } } = class {
    constructor(public name: string) { }
};
let thisInterface: { name: string; age: number } = { name: "TypeScript", age: 6 };
let thisTypeAlias: { name: string; age: number } = { name: "TypeScript", age: 6 };
let thisGeneric: Array<number> = [1, 2, 3, 4, 5];
let thisMappedType: { [K in "name" | "age"]: string | number } = { name: "TypeScript", age: 6 };


console.log(thisTuple);
