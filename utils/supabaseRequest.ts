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
  export const createTrip = async ({ userId, token, trip_name, daterange, image_url }: { userId: string, token: string,trip_name:string, daterange: {from:Date, to:Date}, image_url:string }) => {
    const supabase = await supabaseClient(token);
    // let start = daterange.from.toDateString();
    // let end = daterange.to.toDateString();
    let start = daterange.from;
    let end = daterange.to;
    
    try {
      
      const { data: trips, error: fetchError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', userId)
        .eq('trip_name', trip_name)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        // Handle any error other than 'PGRST116' (which is Supabase's "No Rows Found" error code)
        console.error('Error fetching trip:', fetchError);
        return fetchError;
      }
  
      if (!trips) {
        const { error: insertError } = await supabase
          .from('trips')
          .insert({
            id: userId,
            trip_name: trip_name,
            start_date: start,
            end_date: end,
            image_url: image_url,
          });
  
        if (insertError) {
          console.error('Error creating new trip:', insertError);
          return insertError;
        }
  
        console.log('New trip inserted successfully');
      }
      else{
        console.error('Trip Name already taken.');
        return 
      }
  
    } catch (error) {
      console.error('Error inserting trip:', error);
      return error;
    }
  };

  export const getTrips = async ({ userId, token }: { userId: string, token: string }) => {
    const supabase = await supabaseClient(token);
    try {
      const { data: trips, error: fetchError } = await supabase
        .from('trips')
        .select('trip_name,image_url,start_date,end_date')
        .eq('id', userId)
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        // Handle any error other than 'PGRST116' (which is Supabase's "No Rows Found" error code)
        console.error('Error fetching trip:', fetchError);
        throw fetchError;
      }
      return trips;
  
    } catch (error) {
      console.error('Unexpected Error:', error);
      throw error;
    }
  };

  export const uploadImageToSupabase = async (
    token:string,
    userId: string,
    file: File,
    bucketName: string
  ) => {
    const supabase = await supabaseClient(token);
    try {
      const filePath = `${userId}/${Date.now()}_${file.name}`;
      let imageURL: string | null = null;
  
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file);
  
      if (error) {
        console.error("Error uploading file to Supabase:", error);
        throw new Error("Failed to upload file");
      }
  
      // Get the public URL for the uploaded file
      imageURL = supabase.storage.from(bucketName).getPublicUrl(filePath).data.publicUrl;
  
      return imageURL;
    } catch (error) {
      console.error("Unexpected error during image upload:", error);
      throw error;
    }
  };