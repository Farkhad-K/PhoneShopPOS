export enum Role {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  TECHNICIAN = 'TECHNICIAN',
}

export enum MeasurementType {
  KG = 'KG',
  PIECE = 'UNIT',
}

export enum ProductIngredientSource {
  SEMI_PRODUCT = 'SEMI_PRODUCT',
  RAW_MATERIAL = 'RAW_MATERIAL',
}

export enum ProductSemiProductSource {
  ASSEMBLER = 'ASSEMBLER',
  STORE = 'STORE',
  BOTH = 'BOTH',
}
