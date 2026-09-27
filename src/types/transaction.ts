export enum TransactionType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  PAYMENT = "payment",
  REFUND = "refund",
}

export class WalletTransactionDto {

  patientId!: string;

  amount!: number;

  
  description?: string;
}

export class AppointmentPaymentDto {

  patientId!: string;


  appointmentId!: string;


  amount!: number;

  description?: string;
}


export class AppointmentCancelDto {

  appointmentId!: string;
}


export class WalletParamsDto {
  
  patientId!: string;
}




export class TransactionHistoryQueryDto {
     
  patientId!: string;


  
  
  
  
  page?: number = 1;

  
  
  
  
  limit?: number = 10;

  
   
  type?: TransactionType;

  
  for?: string;

   
  startDate?: string;

  
  
  endDate?: string;
}
