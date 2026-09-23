/** Class (or object) that can map a DTO into a domain model. */
export interface DtoConvertibleClass<Tdto, Tmodel> {
  fromDto(dto: Tdto): Tmodel;
}
