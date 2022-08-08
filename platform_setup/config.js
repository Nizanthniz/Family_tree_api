let db_name="yatta";
let table_config={
    "activity":{
       "activity":{
          "data_type":"VARCHAR",
          "length":50,
          "allow_null":true,
          "default":null
        }
      },
      
    
    "level":{
       "level":{
          "data_type":"VARCHAR",
          "length":50,
          "allow_null":true,
          "default":null
        }
      },
      
      
    "user_type":{
       "user_type":{
          "data_type":"VARCHAR",
          "length":50,
          "allow_null":true,
          "default":null
        }
      },
      
    
    "business_options":{
       "business_options":{
          "data_type":"VARCHAR",
          "length":50,
          "allow_null":true,
          "default":null
        }
      },
      
    
    "gender":{
       "gender":{
          "data_type":"VARCHAR",
          "length":50,
          "allow_null":true,
          "default":null
        }
      },
      
    
    "users":{
        "full_name":{
          "data_type":"VARCHAR",
          "length":50,
          "allow_null":true,
          "default":null
        },
        "user_name":{
          "data_type":"VARCHAR",
          "length":50,
          "allow_null":true,
          "default":null
        },
        "password":{
          "data_type":"VARCHAR",
          "length":50,
          "allow_null":true,
          "default":null
        },
        "email_id":{
          "data_type":"VARCHAR",
          "length":50,
          "allow_null":true,
          "default":null
        },
        "user_type":{
          "data_type":"BIGINT",
          "length":20,
          "allow_null":true,
          "default":null,
          "reference_table":"user_type"
        }
      },
      
      
    "activity_data":{
      "user_id":
          {
          "data_type":"BIGINT",
          "length":20,
          "allow_null":true,
          "default":null,
          "reference_table":"users"
      },
      "activity":
          {
          "data_type":"BIGINT",
          "length":20,
          "allow_null":true,
          "default":null,
          "reference_table":"activity"
      },
        "level":
          {
          "data_type":"BIGINT",
          "length":20,
          "allow_null":true,
          "default":null,
          "reference_table":"level"
      }
      },
      
    "business_info":
      {
      "user_id":
          {
          "data_type":"BIGINT",
          "length":20,
          "allow_null":true,
          "default":null,
          "reference_table":"users"
      },
      "business_option":
          {
          "data_type":"BIGINT",
          "length":20,
          "allow_null":true,
          "default":null,
          "reference_table":"business_options"
      },
      "others":{
          "data_type":"VARCHAR",
          "length":50,
          "allow_null":true,
          "default":null
        },
        "company_name":{
          "data_type":"VARCHAR",
          "length":50,
          "allow_null":true,
          "default":null
        },
        "establishment_date":{
          "data_type":"VARCHAR",
          "length":50,
          "allow_null":true,
          "default":null
        },
        "phone_no":{
          "data_type":"VARCHAR",
          "length":50,
          "allow_null":true,
          "default":null
        }
        
      },
      
     
    "individual_info":
      {
        "user_id":
          {
          "data_type":"BIGINT",
          "length":20,
          "allow_null":true,
          "default":null,
          "reference_table":"users"
      },
      "phone_no":{
          "data_type":"VARCHAR",
          "length":50,
          "allow_null":true,
          "default":null
        },
        "date_of_birth":{
          "data_type":"VARCHAR",
          "length":50,
          "allow_null":true,
          "default":null
        },
        "gender":
          {
          "data_type":"BIGINT",
          "length":20,
          "allow_null":true,
          "default":null,
          "reference_table":"gender"
         },
          "height":{
          "data_type":"VARCHAR",
          "length":50,
          "allow_null":true,
          "default":null
        },
         "weight":{
          "data_type":"VARCHAR",
          "length":50,
          "allow_null":true,
          "default":null
        }
        
      }
    }

module.exports = { db_name, table_config };