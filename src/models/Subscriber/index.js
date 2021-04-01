import { v4 as uuidv4 } from "uuid";

export default class Listener {
  constructor(id = null, action, callback) {
    this.id = id || uuidv4();
    this.action = action;
    this.callback = callback;
  }
}
