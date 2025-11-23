export class ApplicationV2 {
  constructor(options = {}) {
    this.options = options;
  }
}

export function HandlebarsApplicationMixin(Base) {
  return class extends Base {
    constructor(...args) {
      super(...args);
    }
  };
}
