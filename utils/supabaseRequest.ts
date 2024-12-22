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
        const dayArray = [];
        let temp = new Date(start);
        while (temp <= end) {
          dayArray.push(new Date(temp).toLocaleDateString("en-us"));
          temp.setDate(temp.getDate() + 1);
        }
        generateDays({userId,token,trip_name,dayArray});

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

  export const uploadBackgroundToSupabase = async (
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
      console.error("Unexpected error during background upload:", error);
      throw error;
    }
  };

  export const generateDays = async ({ userId, token, trip_name, dayArray}: { userId: string, token: string,trip_name:string, dayArray:string[] }) => {
    const supabase = await supabaseClient(token);
    try {
      for(let index in dayArray){
        const { error: insertError } = await supabase
          .from('logs')
          .insert({
            id: userId,
            trip: trip_name,
            date: dayArray[index],
            day: Number(index)+1,
          })

        if (insertError){
          console.log(`Error creating day ${index+1}`, insertError);
          return insertError
        }
        console.log(`Day ${index+1} created successfully!`)
      }
    } catch (error) {
      console.error('Error creating days:', error);
      return error;
    }
  };

  export const editLog = async ({ userId, token, trip_name, day, entry, title, loc}: { userId: string|undefined|null, token: string,trip_name:string, day:number, entry:string, title:string, loc:string}) => {
    const supabase = await supabaseClient(token);
    try {
      const { error: updateError } = await supabase
        .from('logs')
        .update({
          entry:entry,
          title:title,
          location:loc,
        })
        .eq('id',userId)
        .eq('day',day)
        .eq('trip',trip_name)

      if (updateError){
        console.log(`Error updating day ${day}`, updateError);
        return updateError
      }
      console.log(`Day ${day} updated successfully!`)
      
    } catch (error) {
      console.error('Error creating days:', error);
      return error;
    }
  };

  export const getLog = async ({ userId, token, day, trip_name }: { userId: string|undefined|null, token: string, day:number, trip_name:string }) => {
    const supabase = await supabaseClient(token);
    try {
      const { data: log, error: fetchError } = await supabase
        .from('logs')
        .select('entry,title,location')
        .eq('id', userId)
        .eq('day',day)
        .eq('trip',trip_name)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        // Handle any error other than 'PGRST116' (which is Supabase's "No Rows Found" error code)
        console.error('Error fetching log:', fetchError);
        throw fetchError;
      }
      return log;
  
    } catch (error) {
      console.error('Unexpected Error:', error);
      throw error;
    }
  };

  export const getAllLogs = async ({ userId, token, trip_name }: { userId: string|undefined|null, token: string, trip_name:string }) => {
    const supabase = await supabaseClient(token);
    try {
      const { data: logs, error: fetchError } = await supabase
        .from('logs')
        .select('entry,title,day')
        .eq('id', userId)
        .eq('trip',trip_name)
        .order('day',{ascending:true})
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        // Handle any error other than 'PGRST116' (which is Supabase's "No Rows Found" error code)
        console.error('Error fetching log:', fetchError);
        throw fetchError;
      }
      return logs;
  
    } catch (error) {
      console.error('Unexpected Error:', error);
      throw error;
    }
  };

  export const uploadPhotosToSupabase = async (
    token:string,
    userId: string,
    day:number,
    trip_name:string,
    file: File,
    bucketName: string
  ) => {
    const supabase = await supabaseClient(token);
    try {
      const filePath = `${userId}/${trip_name}/${day}/${Date.now()}_${file.name}`;
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
      console.error("Unexpected error during photo upload:", error);
      throw error;
    }
  };

  export const insertPhotos = async ({ userId, token, trip_name, day, imageURL, lat, long, area}: { userId: string|undefined|null, token: string,trip_name:string, day:number, imageURL:string, lat:number, long:number, area:string }) => {
    const supabase = await supabaseClient(token);
    try {
      const { error: insertError } = await supabase
        .from('photos')
        .insert({
          id:userId,
          day:day,
          trip_name:trip_name,
          imageURL:imageURL,
          lat:lat,
          long:long,
          area:area
        })

      if (insertError){
        console.log(`Error inserting photos for day ${day}`, insertError);
        return insertError
      }
      console.log(`Photo for Day ${day} inserted successfully!`)
      
    } catch (error) {
      console.error(`Error inserting photos for Day ${day}:`, error);
      return error;
    }
  };

  export const getPhotos = async ({ userId, token, trip_name,start_day, end_day }: { userId: string|undefined|null, token: string, trip_name:string, start_day:number, end_day:number }) => {
    const supabase = await supabaseClient(token);
    try {
      let query = supabase.from('photos').select('day,imageURL,lat,long,area').eq('id',userId);
      if(trip_name !== '*'){
        query = query.eq('trip_name',trip_name);
      }
      if(end_day !== -1){
        query = query.gte('day',start_day).lte('day',end_day)
      }
      else{
        query = query.eq('day',start_day);
      }
      const { data: photoInfo, error: fetchError } = await query;
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        // Handle any error other than 'PGRST116' (which is Supabase's "No Rows Found" error code)
        console.error('Error fetching photos:', fetchError);
        throw fetchError;
      }
      return photoInfo;
  
    } catch (error) {
      console.error('Unexpected Error:', error);
      throw error;
    }
  };

  export const deletePhotos = async ({ userId, token, trip_name, day, imageURL }: { userId: string|undefined|null, token: string, trip_name:string, day:number,imageURL:string }) => {
    const supabase = await supabaseClient(token);
    try {
      const {error: fetchError } = await supabase
        .from('photos')
        .delete()
        .eq('id', userId)
        .eq('trip_name',trip_name)
        .eq('day',day)
        .eq('imageURL',imageURL)
      
      // Handle specific Supabase errors
      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          console.warn("No matching rows found to delete.");
          return { message: "No matching rows found.", success: false };
        } else {
          console.error("Error deleting photo:", fetchError.message);
          return new Error(`Failed to delete photo: ${fetchError.message}`);
        }
      }
  
    } catch (error) {
      console.error('Unexpected Error:', error);
      return error;
    }
  };

  export const deleteTrip = async ({ userId, token, trip_name }: { userId: string|undefined|null, token: string, trip_name:string }) => {
    const supabase = await supabaseClient(token);
    try {
      const {error: fetchError } = await supabase
        .from('trips')
        .delete()
        .eq('id', userId)
        .eq('trip_name',trip_name)
      
      // Handle specific Supabase errors
      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          console.error("No matching rows found to delete.");
          return new Error("No matching rows found.");
        } else {
          console.error("Error deleting trip:", fetchError.message);
          return new Error(`Failed to delete trip: ${fetchError.message}`);
        }
      }
  
    } catch (error) {
      console.error('Unexpected Error:', error);
      return error;
    }
  };

  export const updateTrip = async ({ userId, token, trip_name, imageURL}: { userId: string|undefined|null, token: string,trip_name:string, imageURL:string }) => {
    const supabase = await supabaseClient(token);
    try {
      const { error: updateError } = await supabase
        .from('trips')
        .update({
          image_url:imageURL,
        })
        .eq('id',userId)
        .eq('trip_name',trip_name)

      if (updateError){
        console.error(`Error updating cover photo:`, updateError);
        return updateError
      }
      console.log(`Cover photo for ${trip_name} updated successfully!`)
      
    } catch (error) {
      console.error('Unexpected Error when updating tp supabase:', error);
      return error;
    }
  };

  export const updateLatLong = async ({ userId, token, trip_name, imageURL, lat, long, area}: { userId: string|undefined|null, token: string,trip_name:string, imageURL:string, lat:number, long:number, area:string }) => {
    const supabase = await supabaseClient(token);
    try {
      const { error: updateError } = await supabase
        .from('photos')
        .update({
          lat:lat,
          long:long,
          area:area
        })
        .eq('id',userId)
        .eq('trip_name',trip_name)
        .eq('imageURL',imageURL)

      if (updateError){
        console.error(`Error updating location coordinates:`, updateError);
        return updateError
      }
      console.log(`Coordinates for ${area} updated successfully!`)
      
    } catch (error) {
      console.error('Unexpected Error when updating tp supabase:', error);
      return error;
    }
  };

