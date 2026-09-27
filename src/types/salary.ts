export type AddSalaryPayment=["cash", "sheba", "cart", "satna", "havale"]
export type AddSalaryType=["payment", "refund"]


export type PayAt={
      userId:string
      fullName:string
}


export type AddSalary={
     type: AddSalaryType,
      fee: number
      payment: AddSalaryPayment
      coderahgiri:number,
      note: string,
      ATModel:string
      YYYYMM:string
      payDate:string
      payAt:PayAt
}