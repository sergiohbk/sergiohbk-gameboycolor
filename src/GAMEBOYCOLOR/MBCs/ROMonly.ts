import { MBC } from "./MBC";
import { Cartridge } from "../cartridge";

export class ROMonly extends MBC implements MBC {
  constructor(cardridge: Cartridge) {
    super(cardridge);
  }
}
