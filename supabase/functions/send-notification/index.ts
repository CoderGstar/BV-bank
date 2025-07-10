import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  userId: string;
  message: string;
  type: 'email' | 'sms';
  recipient: string;
  transactionId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, message, type, recipient, transactionId }: NotificationRequest = await req.json();

    // Store notification in database
    const { error: dbError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        message,
        notification_type: type,
        recipient,
        transaction_id: transactionId,
        sent_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to store notification' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For demo purposes, we'll just log the notification
    // In production, you would integrate with email/SMS services like SendGrid, Twilio, etc.
    console.log(`${type.toUpperCase()} Notification:`, {
      to: recipient,
      message,
      userId,
      transactionId
    });

    // Simulate successful notification sending
    const response = {
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} notification sent successfully`,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-notification function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});