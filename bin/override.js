const corePath = process.argv[2];
const overrideComment = process.argv[3];

console.log(corePath);
console.log(overrideComment);

console.log(process.env.OVERRIDE_SRC)