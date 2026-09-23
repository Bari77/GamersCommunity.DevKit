export interface DtoConvertibleClass<Tdto, Tmodel> {
  new (...args: unknown[]): Tmodel;
  fromDto(dto: Tdto): Tmodel;
}
