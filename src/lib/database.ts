import { supabase, supabaseAdmin } from "./supabase";

export const connectDB = async () => {
    try {
        // Test connection - just verify the client is working
        const { data, error } = await supabase.auth.getSession();

        if (error && error.message !== "Auth session missing!") {
            console.error("Error connecting to Supabase:", error);
            throw error;
        }

        console.log("Supabase connected successfully");
        return { supabase, supabaseAdmin };
    } catch (error) {
        console.error("Failed to connect to Supabase:", error);
        throw error;
    }
};

export { supabase, supabaseAdmin };

