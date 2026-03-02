/**
 * Data Service - Supabase Integration
 * Replaces all REST API fetch calls with direct Supabase database queries.
 * 
 * Tables required in Supabase:
 *   - cranes
 *   - trucks
 *   - crane_bookings
 *   - truck_bookings
 */

import { supabase } from './supabase';

// ─── CRANES ──────────────────────────────────────────────

/**
 * List cranes, optionally filtered by availability status.
 */
export async function listCranes(status) {
    let query = supabase.from('cranes').select('*').order('created_at', { ascending: false });
    if (status) {
        query = query.eq('availability_status', status);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

/**
 * Get a single crane by ID.
 */
export async function getCrane(id) {
    const { data, error } = await supabase
        .from('cranes')
        .select('*')
        .eq('id', id)
        .single();
    if (error) throw error;
    return data;
}

/**
 * Create a new crane.
 */
export async function createCrane(craneData) {
    const { data, error } = await supabase
        .from('cranes')
        .insert([{
            name: craneData.name,
            capacity: craneData.capacity,
            price_per_hour: parseFloat(craneData.price_per_hour),
            location: craneData.location || null,
            description: craneData.description || null,
            images: craneData.images || [],
            availability_status: 'available',
        }])
        .select()
        .single();
    if (error) throw error;
    return data;
}

/**
 * Delete a crane by ID.
 */
export async function deleteCrane(id) {
    const { error } = await supabase
        .from('cranes')
        .delete()
        .eq('id', id);
    if (error) throw error;
    return true;
}


// ─── TRUCKS ──────────────────────────────────────────────

/**
 * List trucks, optionally filtered by availability status.
 */
export async function listTrucks(status) {
    let query = supabase.from('trucks').select('*').order('created_at', { ascending: false });
    if (status) {
        query = query.eq('availability_status', status);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

/**
 * Get a single truck by ID.
 */
export async function getTruck(id) {
    const { data, error } = await supabase
        .from('trucks')
        .select('*')
        .eq('id', id)
        .single();
    if (error) throw error;
    return data;
}

/**
 * Create a new truck.
 */
export async function createTruck(truckData) {
    const { data, error } = await supabase
        .from('trucks')
        .insert([{
            name: truckData.name,
            tonnage: truckData.tonnage,
            price_per_hour: parseFloat(truckData.price_per_hour),
            location: truckData.location || null,
            description: truckData.description || null,
            images: truckData.images || [],
            availability_status: 'available',
        }])
        .select()
        .single();
    if (error) throw error;
    return data;
}

/**
 * Delete a truck by ID.
 */
export async function deleteTruck(id) {
    const { error } = await supabase
        .from('trucks')
        .delete()
        .eq('id', id);
    if (error) throw error;
    return true;
}


// ─── CRANE BOOKINGS ──────────────────────────────────────

/**
 * Generate a booking ID like CRN-20260320-001
 */
async function generateCraneBookingId(bookingDate) {
    const dateStr = bookingDate.replace(/-/g, '');
    const { count, error } = await supabase
        .from('crane_bookings')
        .select('*', { count: 'exact', head: true })
        .like('booking_id', `CRN-${dateStr}-%`);

    const seqNum = ((count || 0) + 1).toString().padStart(3, '0');
    return `CRN-${dateStr}-${seqNum}`;
}

/**
 * Create a crane booking.
 */
export async function createCraneBooking(bookingData) {
    // Get crane details for price calculation
    const crane = await getCrane(bookingData.crane_id);
    if (!crane) throw new Error('Crane not found');

    const durationHours = parseInt(bookingData.duration);
    let totalPrice = parseFloat(crane.price_per_hour) * durationHours;
    if (bookingData.is_emergency) {
        totalPrice = totalPrice * 1.5;
    }

    const bookingId = await generateCraneBookingId(bookingData.booking_date);

    const { data, error } = await supabase
        .from('crane_bookings')
        .insert([{
            booking_id: bookingId,
            crane_id: parseInt(bookingData.crane_id),
            user_name: bookingData.user_name,
            user_phone: bookingData.user_phone,
            booking_date: bookingData.booking_date,
            start_time: bookingData.start_time,
            duration_hours: durationHours,
            site_location: bookingData.site_location,
            is_emergency: bookingData.is_emergency || false,
            total_price: totalPrice,
            status: 'pending',
        }])
        .select()
        .single();

    if (error) throw error;

    // Build WhatsApp message
    const whatsappMessage = `🏗️ New Crane Booking!\n\nBooking ID: ${data.booking_id}\nCrane: ${crane.name} (${crane.capacity})\nCustomer: ${data.user_name}\nPhone: ${data.user_phone}\nDate: ${data.booking_date}\nTime: ${data.start_time}\nDuration: ${data.duration_hours} hours\nLocation: ${data.site_location}\n${data.is_emergency ? '⚡ EMERGENCY BOOKING\n' : ''}Total: ₹${data.total_price}`;

    return {
        booking: {
            ...data,
            crane_name: crane.name,
            crane_capacity: crane.capacity,
        },
        whatsapp_message: whatsappMessage,
    };
}


// ─── TRUCK BOOKINGS ──────────────────────────────────────

/**
 * Generate a booking ID like TRK-20260320-001
 */
async function generateTruckBookingId(bookingDate) {
    const dateStr = bookingDate.replace(/-/g, '');
    const { count, error } = await supabase
        .from('truck_bookings')
        .select('*', { count: 'exact', head: true })
        .like('booking_id', `TRK-${dateStr}-%`);

    const seqNum = ((count || 0) + 1).toString().padStart(3, '0');
    return `TRK-${dateStr}-${seqNum}`;
}

/**
 * Create a truck booking.
 */
export async function createTruckBooking(bookingData) {
    // Get truck details for price calculation
    const truck = await getTruck(bookingData.truck_id);
    if (!truck) throw new Error('Truck not found');

    const durationHours = parseInt(bookingData.duration);
    let totalPrice = parseFloat(truck.price_per_hour) * durationHours;
    if (bookingData.is_emergency) {
        totalPrice = totalPrice * 1.5;
    }

    const bookingId = await generateTruckBookingId(bookingData.booking_date);

    const { data, error } = await supabase
        .from('truck_bookings')
        .insert([{
            booking_id: bookingId,
            truck_id: parseInt(bookingData.truck_id),
            user_name: bookingData.user_name,
            user_phone: bookingData.user_phone,
            booking_date: bookingData.booking_date,
            start_time: bookingData.start_time,
            duration_hours: durationHours,
            site_location: bookingData.site_location,
            is_emergency: bookingData.is_emergency || false,
            total_price: totalPrice,
            status: 'pending',
        }])
        .select()
        .single();

    if (error) throw error;

    // Build WhatsApp message
    const whatsappMessage = `🚛 New Truck Booking!\n\nBooking ID: ${data.booking_id}\nTruck: ${truck.name} (${truck.tonnage})\nCustomer: ${data.user_name}\nPhone: ${data.user_phone}\nDate: ${data.booking_date}\nTime: ${data.start_time}\nDuration: ${data.duration_hours} hours\nLocation: ${data.site_location}\n${data.is_emergency ? '⚡ EMERGENCY BOOKING\n' : ''}Total: ₹${data.total_price}`;

    return {
        booking: {
            ...data,
            truck_name: truck.name,
            truck_tonnage: truck.tonnage,
        },
        whatsapp_message: whatsappMessage,
    };
}


// ─── BOOKINGS LOOKUP (by phone) ──────────────────────────

/**
 * List all bookings (crane + truck) for a given phone number.
 */
export async function listBookingsByPhone(userPhone) {
    // Fetch crane bookings
    const { data: craneBookings, error: craneError } = await supabase
        .from('crane_bookings')
        .select('*, cranes(name, capacity)')
        .eq('user_phone', userPhone)
        .order('created_at', { ascending: false });

    if (craneError) throw craneError;

    // Fetch truck bookings
    const { data: truckBookings, error: truckError } = await supabase
        .from('truck_bookings')
        .select('*, trucks(name, tonnage)')
        .eq('user_phone', userPhone)
        .order('created_at', { ascending: false });

    if (truckError) throw truckError;

    // Merge and normalize
    const allBookings = [
        ...(craneBookings || []).map(b => ({
            id: b.id,
            booking_id: b.booking_id,
            type: 'crane',
            crane_name: b.cranes?.name || 'Unknown Crane',
            crane_capacity: b.cranes?.capacity || '',
            truck_name: null,
            user_name: b.user_name,
            user_phone: b.user_phone,
            booking_date: b.booking_date,
            start_time: b.start_time,
            duration: b.duration_hours,
            site_location: b.site_location,
            is_emergency: b.is_emergency,
            total_price: b.total_price,
            status: b.status,
            created_at: b.created_at,
        })),
        ...(truckBookings || []).map(b => ({
            id: b.id,
            booking_id: b.booking_id,
            type: 'truck',
            crane_name: null,
            crane_capacity: null,
            truck_name: b.trucks?.name || 'Unknown Truck',
            user_name: b.user_name,
            user_phone: b.user_phone,
            booking_date: b.booking_date,
            start_time: b.start_time,
            duration: b.duration_hours,
            site_location: b.site_location,
            is_emergency: b.is_emergency,
            total_price: b.total_price,
            status: b.status,
            created_at: b.created_at,
        })),
    ];

    // Sort by created_at descending
    allBookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return allBookings;
}


// ─── ADMIN ───────────────────────────────────────────────

/**
 * Get admin analytics (dashboard stats).
 */
export async function getAdminAnalytics() {
    // Count crane bookings
    const { count: craneBookingCount } = await supabase
        .from('crane_bookings')
        .select('*', { count: 'exact', head: true });

    // Count truck bookings
    const { count: truckBookingCount } = await supabase
        .from('truck_bookings')
        .select('*', { count: 'exact', head: true });

    // Count pending crane bookings
    const { count: pendingCraneCount } = await supabase
        .from('crane_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    // Count pending truck bookings
    const { count: pendingTruckCount } = await supabase
        .from('truck_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    // Revenue from crane bookings
    const { data: craneRevenue } = await supabase
        .from('crane_bookings')
        .select('total_price')
        .in('status', ['approved', 'completed']);

    // Revenue from truck bookings
    const { data: truckRevenue } = await supabase
        .from('truck_bookings')
        .select('total_price')
        .in('status', ['approved', 'completed']);

    const totalCraneRevenue = (craneRevenue || []).reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
    const totalTruckRevenue = (truckRevenue || []).reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);

    // Available cranes
    const { count: availableCranes } = await supabase
        .from('cranes')
        .select('*', { count: 'exact', head: true })
        .eq('availability_status', 'available');

    // Available trucks
    const { count: availableTrucks } = await supabase
        .from('trucks')
        .select('*', { count: 'exact', head: true })
        .eq('availability_status', 'available');

    // Recent crane bookings
    const { data: recentCraneBookings } = await supabase
        .from('crane_bookings')
        .select('*, cranes(name, capacity)')
        .order('created_at', { ascending: false })
        .limit(10);

    // Recent truck bookings
    const { data: recentTruckBookings } = await supabase
        .from('truck_bookings')
        .select('*, trucks(name, tonnage)')
        .order('created_at', { ascending: false })
        .limit(10);

    // Merge recent bookings
    const recentBookings = [
        ...(recentCraneBookings || []).map(b => ({
            id: b.id,
            booking_id: b.booking_id,
            type: 'crane',
            crane_name: b.cranes?.name || 'Unknown Crane',
            truck_name: null,
            user_name: b.user_name,
            user_phone: b.user_phone,
            booking_date: b.booking_date,
            total_price: b.total_price,
            status: b.status,
            created_at: b.created_at,
        })),
        ...(recentTruckBookings || []).map(b => ({
            id: b.id,
            booking_id: b.booking_id,
            type: 'truck',
            crane_name: null,
            truck_name: b.trucks?.name || 'Unknown Truck',
            user_name: b.user_name,
            user_phone: b.user_phone,
            booking_date: b.booking_date,
            total_price: b.total_price,
            status: b.status,
            created_at: b.created_at,
        })),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);

    return {
        totalBookings: (craneBookingCount || 0) + (truckBookingCount || 0),
        pendingBookings: (pendingCraneCount || 0) + (pendingTruckCount || 0),
        totalRevenue: totalCraneRevenue + totalTruckRevenue,
        availableCranes: availableCranes || 0,
        availableTrucks: availableTrucks || 0,
        recentBookings,
    };
}

/**
 * Update booking status (approve/reject). Works for both crane and truck bookings.
 */
export async function updateBookingStatus(bookingId, status, bookingType) {
    // Determine the correct table based on the booking ID prefix or explicit type
    let table = 'crane_bookings';
    if (bookingType === 'truck' || (typeof bookingId === 'string' && bookingId.startsWith('TRK'))) {
        table = 'truck_bookings';
    }

    // Try by numeric id first
    let query;
    if (typeof bookingId === 'number' || !isNaN(Number(bookingId))) {
        // It's a numeric ID - we need to check both tables
        const { data: craneBooking } = await supabase
            .from('crane_bookings')
            .select('id')
            .eq('id', bookingId)
            .single();

        if (craneBooking) {
            table = 'crane_bookings';
        } else {
            table = 'truck_bookings';
        }

        const { data, error } = await supabase
            .from(table)
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', bookingId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } else {
        // It's a booking_id string
        const { data, error } = await supabase
            .from(table)
            .update({ status, updated_at: new Date().toISOString() })
            .eq('booking_id', bookingId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
