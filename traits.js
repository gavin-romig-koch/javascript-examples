
var Talkative = function () {
    this.makeSound = function () {
        console.log(this.sound);
    }
};
var cat = {
  sound: "meow",
};
var dog = {
 sound: "woof"
};
Talkative.call(cat);
Talkative.apply(dog);

cat.makeSound(); // "meow"
dog.makeSound(); // "woof"
