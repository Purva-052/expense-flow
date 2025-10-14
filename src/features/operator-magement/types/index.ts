// src/features/operators/types.ts

// The response structure from the API for a list of operators
export interface OperatorsResponse {
  docs:  Operator[];
  count: number;
}

// The main Operator entity type, matching your database/API response
// export interface Operator {
//   operator_id:   string;
//   name:          string;
//   email:         string;
//   mobile:        string;
//   user_name:     string;
//   created_at:    Date;
//   updated_at:    Date;
// }

// The type for the form data when creating/updating an operator
// We make password optional because you might not want to update it on every edit.
export interface OperatorForm {
  name: string;
  email: string;
  mobile: string;
  user_name?: string;
  password?: string;
}


export interface Operator {
  user_id:           string;
  name:              string;
  user_name:         string;
  employee_id:       string;
  is_online:         boolean;
  email:             string;
  country_code:      null;
  mobile:            string;
  profile_pic:       string;
  wallet:            number;
  fcm:               string;
  login_type:        string;
  gender:            string;
  device_type:       string;
  status:            boolean;
  is_email_verified: boolean;
  access_token:      string;
  created_at:        Date;
  updated_at:        Date;
  deletedAt:         null;
  role:              Role;
}

export interface Role {
  role_id:    string;
  name:       string;
  created_at: Date;
  updated_at: Date;
  deletedAt:  null;
}
