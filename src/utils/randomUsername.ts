import * as bip39 from "bip39";
import { capitalCase } from "capital-case";
import { randomDigits } from "./randomDigits";

export function randomUsername() {
    const seed = bip39.generateMnemonic();
    const words = seed.split(" ");
    const addendum = randomDigits(3);

    return `${capitalCase(words[0])}${capitalCase(
        words[1]
    )}${addendum.toString()}`;
}
