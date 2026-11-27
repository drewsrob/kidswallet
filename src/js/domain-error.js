export class DomainError extends Error {
  constructor(key, params) {
    super(key);
    this.name = 'DomainError';
    this.code = key;
    this.params = params;
  }
}
