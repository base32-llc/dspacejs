import * as bip39 from "bip39";
import { capitalCase } from "capital-case";
import nacl from "tweetnacl";
import { uint8ArrToNumber } from "./uint8ArrToNumber";

export function randomUsername() {
    const seed = bip39.generateMnemonic();
    const words = seed.split(" ");

    const addendum = uint8ArrToNumber(nacl.randomBytes(1));

    return `${capitalCase(words[0])}${capitalCase(
        words[1]
    )}${addendum.toString()}`;
}
