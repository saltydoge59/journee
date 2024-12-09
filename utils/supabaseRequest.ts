import { supabaseClient } from "./supabaseClient";

// Define the types for userId, token, and username
export const insertUser = async ({ userId, token, username }: { userId: string, token: string, username: string }) => {
    const supabase = await supabaseClient(token);
    
    try {
      // Check if the user already exists in the database
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        // Handle any error other than 'PGRST116' (which is Supabase's "No Rows Found" error code)
        console.error('Error fetching user:', fetchError);
        return fetchError;
      }
  
      const currentTime = new Date();
  
      if (!existingUser) {
        // If the user does not exist, insert a new record with created_at, last_login, and username
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            username: username, // Insert the username
            created_at: currentTime
          });
  
        if (insertError) {
          console.error('Error inserting new user:', insertError);
          return insertError;
        }
  
        console.log('New user inserted successfully');
      }
  
    } catch (error) {
      console.error('Error during insert operation:', error);
      return error;
    }
  };