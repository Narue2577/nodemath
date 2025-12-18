// src/components/AirplaneSeatBookingAdmin.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { Check, X,User,Users2 } from 'lucide-react';
import { useSession } from "next-auth/react";

/* eslint-disable */
interface AirplaneSeatBookingAdminProps {
  tableHeader?: string; // This can be removed if you only use session
}

const AirplaneSeatBookingAdmin: React.FC<AirplaneSeatBookingAdminProps> = ({ tableHeader }) => {
  const { data: session, status } = useSession();
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [inputMode, setInputMode] = useState('add');
    const [bookings, setBookings] = useState({});
    const [pendingSeats, setPendingSeats] = useState({}); 
    const [isLoading, setIsLoading] = useState(false);
    const [dateTimeInputs, setDateTimeInputs] = useState({});
    const [bulkDateTime, setBulkDateTime] = useState({
      dateIn: '',
      dateOut: '',
      periodTime: 'choose'
    });
    const [formInput, setFormInput] = useState({
      seatId: '',
      dateIn: '',
      dateOut: '',
      periodTime: 'choose'
    });
    const [options, setOptions] = useState([]);
    const [selectedAdvisor, setSelectedAdvisor] = useState('');
  
    // Get username from session or fallback to prop
    const username = session?.user?.name || tableHeader || 'Guest';
    const major = session?.user?.field || 'Not specified';
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
  
    const rooms = [
      {
        id: 'room601',
        name: 'Computer Room 601',
        capacity: 54,
        rows: 7,
        seatsPerRow: 8,
        unused: ['4E','5E'],
        occupied: ['1A'],
        layout: [
          { section: 'Room 601', rows: 7, seatsPerRow: 8, seatWidth: 'A B C D   E F G H' }
        ]
      },
      {
        id: 'room602',
        name: 'Computer Room 602',
        capacity: 54,
        rows: 8,
        seatsPerRow: 8,
        unused: ['1A','1B','1G','1H','2A','5A','5H','6A','6H'],
        occupied: [],
        layout: [
          { section: 'Room 602', rows: 8, seatsPerRow: 8, seatWidth: 'A B C D   E F G H' }
        ]
      },
      {
        id: 'room701',
        name: 'Computer Room 701',
        capacity: 54,
        rows: 7,
        seatsPerRow: 8,
        unused: ['4E','5E'],
        occupied: [],
        layout: [
          { section: 'Room 701', rows: 7, seatsPerRow: 8, seatWidth: 'A B C D   E F G H' }
        ]
      },
      {
        id: 'room801',
        name: 'Computer Room 801',
        capacity: 55,
        rows: 8,
        seatsPerRow: 8,
        unused: ['1B','1C','1D','1E','1F','1G','1H','5E','6E'],
        occupied: [],
        layout: [
          { section: 'Room 801', rows: 8, seatsPerRow: 8, seatWidth: 'A B C D   E F G H' }
        ]
      },
      {
        id: 'room802',
        name: 'Computer Room 802',
        capacity: 56,
        rows: 8,
        seatsPerRow: 8,
        unused: ['1A','1B','1G','1H','5A','5H', '6A','6H'],
        occupied: [],
        layout: [
          { section: 'Room 802', rows: 8, seatsPerRow: 8, seatWidth: 'A B C D   E F G H' }
        ]
      }
    ];
  
    // Fetch reservations from database
    const fetchReservations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/reservations?role=admin', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
  
        if (response.ok) {
          const data = await response.json();
          const reservationsByRoom:any = {};
          const pendingByRoom:any = {};
          
          if (data.reservations && Array.isArray(data.reservations)) {
            data.reservations.forEach(reservation => {
              if (reservation.room && reservation.seat) {
                if (reservation.status === 'pending') {
                  if (!pendingByRoom[reservation.room]) {
                    pendingByRoom[reservation.room] = [];
                  }
                  pendingByRoom[reservation.room].push(reservation.seat);
                } else {
                  if (!reservationsByRoom[reservation.room]) {
                    reservationsByRoom[reservation.room] = [];
                  }
                  reservationsByRoom[reservation.room].push(reservation.seat);
                }
              }
            });
          }
          setBookings(reservationsByRoom);
          setPendingSeats(pendingByRoom);
        } else {
          console.warn('Failed to fetch reservations:', response.status);
        }
      } catch (error) {
        console.error('Error fetching reservations:', error);
        setBookings({});
        setPendingSeats({});
      } finally {
        setIsLoading(false);
      }
    };
  
    useEffect(() => {
     // fetch('/api/dropdown')
     //   .then((res) => res.json())
     //   .then((data) => {
      //    setOptions(data);
      //    setIsLoading(false);
       // })
       // .catch((err) => {
       //   console.error('Error fetching data:', err);
       //   setIsLoading(false);
      //  });
    }, []); 
  
    useEffect(() => {
      fetchReservations();
    }, []);
  
    // Generate seat map
    const generateSeatMap = (room) => {
      const seatMap = [];
      const seatPattern = room.layout[0].seatWidth;
      const seatLetters = seatPattern.replace(/\s+/g, '').split('');
      
      for (let row = 1; row <= room.rows; row++) {
        const rowSeats = [];
        
        seatLetters.forEach((letter) => {
          const seatId = `${row}${letter}`;
          rowSeats.push({
            id: seatId,
            occupied: bookings[room.id]?.includes(seatId) || false,
            unused: room.unused.includes(seatId),
            selected: selectedSeats.includes(seatId)
          });
        });
        
        seatMap.push({
          rowNumber: row,
          seats: rowSeats,
          layout: seatPattern
        });
      }
      
      return seatMap;
    };
  
    const handleFormInputChange = (field, value) => {
      setFormInput(prev => ({
        ...prev,
        [field]: value
      }));
    };
  
    const handleAddSeat = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      const seatId = formInput.seatId.toUpperCase().trim();
      
      if (!seatId) {
        alert('Please enter a seat ID');
        return;
      }
  
      const seatRegex = /^[1-9][0-9]?[A-H]$/;
      if (!seatRegex.test(seatId)) {
        alert('Invalid seat format. Use format like 1A, 2B, etc.');
        return;
      }
  
      const seatPattern = selectedRoom.layout[0].seatWidth;
      const seatLetters = seatPattern.replace(/\s+/g, '').split('');
      const rowNum = parseInt(seatId.slice(0, -1));
      const seatLetter = seatId.slice(-1);
      
      if (rowNum > selectedRoom.rows || !seatLetters.includes(seatLetter)) {
        alert('Seat does not exist in this room');
        return;
      }
  
      if (selectedRoom.unused.includes(seatId)) {
        alert('This seat is not available');
        return;
      }
  
      if (bookings[selectedRoom.id]?.includes(seatId)) {
        alert('This seat is already occupied');
        return;
      }
  
      if (pendingSeats[selectedRoom.id]?.includes(seatId)) {
        alert('This seat has a pending reservation');
        return;
      }
  
      if (selectedSeats.includes(seatId)) {
        alert('This seat is already in your selection');
        return;
      }
  
      if (!formInput.dateIn || !formInput.dateOut || formInput.periodTime === 'choose') {
        alert('Please complete all date and time fields');
        return;
      }
  
      setSelectedSeats([...selectedSeats, seatId]);
      setDateTimeInputs({
        ...dateTimeInputs,
        [seatId]: {
          dateIn: formInput.dateIn,
          dateOut: formInput.dateOut,
          periodTime: formInput.periodTime
        }
      });
  
      setFormInput({
        seatId: '',
        dateIn: formInput.dateIn,
        dateOut: formInput.dateOut,
        periodTime: formInput.periodTime
      });
    };
  
    const handleAddAllSeats = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      if (!bulkDateTime.dateIn || !bulkDateTime.dateOut || bulkDateTime.periodTime === 'choose') {
        alert('Please complete all date and time fields for bulk booking');
        return;
      }
  
      const availableSeats = [];
      const seatPattern = selectedRoom.layout[0].seatWidth;
      const seatLetters = seatPattern.replace(/\s+/g, '').split('');
      
      for (let row = 1; row <= selectedRoom.rows; row++) {
        seatLetters.forEach((letter) => {
          const seatId = `${row}${letter}`;
          if (!selectedRoom.unused.includes(seatId) && 
              !bookings[selectedRoom.id]?.includes(seatId) &&
              !pendingSeats[selectedRoom.id]?.includes(seatId) &&
              !selectedSeats.includes(seatId)) {
            availableSeats.push(seatId);
          }
        });
      }
  
      if (availableSeats.length === 0) {
        alert('No available seats to add');
        return;
      }
  
      const newDateTimeInputs = { ...dateTimeInputs };
      availableSeats.forEach(seatId => {
        newDateTimeInputs[seatId] = {
          dateIn: bulkDateTime.dateIn,
          dateOut: bulkDateTime.dateOut,
          periodTime: bulkDateTime.periodTime
        };
      });
  
      setSelectedSeats([...selectedSeats, ...availableSeats]);
      setDateTimeInputs(newDateTimeInputs);
  
      alert(`Added ${availableSeats.length} seats to your booking`);
    };
  
    const handleBulkDateTimeChange = (field, value) => {
      setBulkDateTime(prev => ({
        ...prev,
        [field]: value
      }));
    };
  
    const handleDateTimeChange = (seatId, field, value) => {
      setDateTimeInputs(prev => ({
        ...prev,
        [seatId]: {
          ...prev[seatId],
          [field]: value
        }
      }));
    };
  
    const handleRemoveSeat = (seatId) => {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
      const newInputs = { ...dateTimeInputs };
      delete newInputs[seatId];
      setDateTimeInputs(newInputs);
    };
  
      // Improved booking validation and error handling
  const validateBookingData = () => {
    if (selectedSeats.length === 0) {
      return { valid: false, message: 'Please select at least one seat.' };
    }
  
    if (!selectedRoom) {
      return { valid: false, message: 'Please select a room.' };
    }
  
   
  
    // FOR BULK/ALL MODE: Use bulkDateTime (single set of dates for all seats)
    if (inputMode === 'all') {
      if (!bulkDateTime.dateIn || !bulkDateTime.dateOut || !bulkDateTime.periodTime || bulkDateTime.periodTime === 'choose') {
        return { valid: false, message: 'Please complete all date and time fields.' };
      }
  
      const dateIn = new Date(bulkDateTime.dateIn);
      const dateOut = new Date(bulkDateTime.dateOut);
  
      if (isNaN(dateIn.getTime()) || isNaN(dateOut.getTime())) {
        return { valid: false, message: 'Invalid date format.' };
      }
  
      if (dateOut < dateIn) {
        return { valid: false, message: 'End date must be after start date.' };
      }
  
      return { valid: true };
    }
  
    // FOR INDIVIDUAL MODE: Use dateTimeInputs (separate dates for each seat)
    if (inputMode === 'add') {
      for (const seatId of selectedSeats) {
        const seatData = dateTimeInputs[seatId];
        
        if (!seatData) {
          return { valid: false, message: `Please fill in all fields for seat ${seatId}.` };
        }
        
        if (!seatData.dateIn || !seatData.dateOut || !seatData.periodTime || seatData.periodTime === 'choose') {
          return { valid: false, message: `Please complete all fields for seat ${seatId}.` };
        }
  
        const dateIn = new Date(seatData.dateIn);
        const dateOut = new Date(seatData.dateOut);
  
        if (isNaN(dateIn.getTime()) || isNaN(dateOut.getTime())) {
          return { valid: false, message: `Invalid date format for seat ${seatId}.` };
        }
        
        if (dateOut < dateIn) {
          return { valid: false, message: `End date must be after start date for seat ${seatId}.` };
        }
      }
    }
  
    return { valid: true };
  };
  
  // Enhanced booking handler with better error handling
  const handleBooking = async () => {
    const validation = validateBookingData();
    
    if (!validation.valid) {
      alert(validation.message);
      return;
    }
  
    setIsLoading(true);
  
    // Create payload BEFORE resetting states
    const payload = {
      username: username,
      major: major,
      room: selectedRoom.id,
      seats: selectedSeats.map(seatId => ({
        seat: seatId,
        date_in: inputMode === 'add' ? dateTimeInputs[seatId].dateIn : bulkDateTime.dateIn,
        date_out: inputMode === 'add' ? dateTimeInputs[seatId].dateOut : bulkDateTime.dateOut,
        period_time: inputMode === 'add' ? dateTimeInputs[seatId].periodTime : bulkDateTime.periodTime,
        advisor_name: '-',
      })),
    };
  
    console.log("Booking payload:", payload);
  
    try {
      const response = await fetch('/api/reservations?role=admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });
  
      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server');
      }
  
      if (response.ok) {
        alert(`Successfully booked ${selectedSeats.length} seat(s) in ${selectedRoom.name}! You need to get confirmed by Admin. Please check your reservation status.`);
        
        // Reset states after successful booking
        setSelectedSeats([]);
        setDateTimeInputs({});
        setBulkDateTime({ dateIn: '', dateOut: '', periodTime: 'choose' });
        setFormInput({ seatId: '', dateIn: '', dateOut: '', periodTime: 'choose' });
        setSelectedAdvisor('');
        
        // Refresh reservations from database
        await fetchReservations();
      } else {
        const errorMessage = responseData?.message || responseData?.error || 'Failed to book seats';
        console.error('Booking failed:', response.status, errorMessage);
        alert(`Booking failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Network or parsing error:', error);
      alert(`An error occurred while booking: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
    const renderSeat = (seat) => {
      const isPending = pendingSeats[selectedRoom.id]?.includes(seat.id) || false;
      let className = "w-10 h-10 border-2 flex items-center justify-center text-xs font-bold transition-all";
      
      if (seat.unused) {
        className += " bg-gray-800 border-gray-900 text-white";
      } else if (seat.occupied) {
        className += " bg-red-500 border-red-600 text-white";
      } else if (isPending) {
        className += " bg-yellow-400 border-yellow-500 text-gray-800";
      } else if (seat.selected) {
        className += " bg-blue-500 border-blue-600 text-white scale-110";
      } else {
        className += " bg-green-100 border-green-400 text-green-800";
      }
  
      return (
        <div key={seat.id} className={className}>
          {seat.unused ? 'X' : seat.occupied ? <X className="w-3 h-3 text-white" /> : seat.selected ? <Check className="w-3 h-3 text-white" /> : seat.id.slice(-1)}
        </div>
      );
    };
  
    const renderSeatRow = (row) => {
      const elements = [];
      const pattern = row.layout.split('');
      let seatIndex = 0;
  
      pattern.forEach((char, index) => {
        if (char === ' ') {
          elements.push(<div key={`space-${index}`} className="w-6"></div>);
        } else {
          elements.push(renderSeat(row.seats[seatIndex]));
          seatIndex++;
        }
      });
  
      return (
        <div key={row.rowNumber} className="flex items-center gap-2 mb-2">
          <div className="w-8 text-center font-bold text-gray-600">{row.rowNumber}</div>
          <div className="flex gap-1">{elements}</div>
        </div>
      );
    };
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 w-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Computer Seat Booking System</h1>
            <p className="text-gray-600 text-center">Welcome {username}</p>
          </div>
  
          {/* Room Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 w-full">
            <h2 className="text-xl font-bold mb-4 text-center">Select Room</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => {
                    setSelectedRoom(room);
                    setSelectedSeats([]);
                    setDateTimeInputs({});
                    setFormInput({ seatId: '', dateIn: '', dateOut: '', periodTime: 'choose' });
                    setBulkDateTime({ dateIn: '', dateOut: '', periodTime: 'choose' });
                  }}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedRoom?.id === room.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <h3 className="font-bold text-lg text-center">{room.name}</h3>
                  <p className="text-sm text-gray-600 text-center">Capacity: {room.capacity}</p>
                  <p className="text-sm text-gray-600 text-center">
                    Occupied: {bookings[room.id]?.length || 0}
                  </p>
                </div>
              ))}
            </div>
          </div>
  
          {selectedRoom && (
            <>
              {/* Seat Map */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 w-full">
                <h2 className="text-xl font-bold mb-4 text-center">Seat Map - {selectedRoom.name}</h2>
                <p className="text-sm text-gray-600 mb-4 text-center">Visual reference only - use the input form below to add seats</p>
                
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-6 text-sm justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 border-2 border-green-400"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 border-2 border-blue-600"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-400 border-2 border-yellow-500"></div>
                    <span>Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-500 border-2 border-red-600"></div>
                    <span>Occupied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-800 border-2 border-gray-900"></div>
                    <span>Not Available</span>
                  </div>
                </div>
  
                <div className="flex justify-center overflow-x-auto">
                  <div className="inline-block">
                    {generateSeatMap(selectedRoom).map(renderSeatRow)}
                  </div>
                </div>
              </div>
  
              {/* Combined Input Mode and Input Form */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 w-full">
                <h2 className="text-xl font-bold mb-4 text-center">Add Seats to Booking</h2>
                
                {/* Input Mode Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-center">Input Mode</h3>
                  <div className="flex gap-4 justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setInputMode('add');
                      }}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
                        inputMode === 'add'
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      Individual
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setInputMode('all');
                      }}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
                        inputMode === 'all'
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      All Available
                    </button>
                  </div>
                </div>
  
                {/* Divider */}
                <div className="border-t border-gray-300 my-6"></div>
  
                {/* Input Form */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">
                    {inputMode === 'add' ? 'Enter Seat Details' : 'Set Details for All Seats'}
                  </h3>
                  
                  {inputMode === 'add' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-center">Seat ID</label>
                          <input
                            type="text"
                            placeholder="e.g., 1A"
                            value={formInput.seatId}
                            onChange={(e) => handleFormInputChange('seatId', e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSeat(e);
                              }
                            }}
                            className="w-full px-3 py-2 border rounded-lg uppercase text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-center">Date In</label>
                          <input
                            type="date"
                            value={formInput.dateIn}
                            onChange={(e) => handleFormInputChange('dateIn', e.target.value)}
                            min={minDate}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-center">Date Out</label>
                          <input
                            type="date"
                            value={formInput.dateOut}
                            onChange={(e) => handleFormInputChange('dateOut', e.target.value)}
                            min={minDate}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-center">Period Time</label>
                          <select
                            value={formInput.periodTime}
                            onChange={(e) => handleFormInputChange('periodTime', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="choose">Choose time</option>
                            <option value="9:00-12:00">9:00 - 12:00</option>
                            <option value="13:00-16:00">13:00 - 16:00</option>
                            <option value="9:00-16:00">9:00 - 16:00</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-center">&nbsp;</label>
                          <button
                            type="button"
                            onClick={handleAddSeat}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-bold"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                      
                      
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-center">Date In</label>
                          <input
                            type="date"
                            value={bulkDateTime.dateIn}
                            onChange={(e) => handleBulkDateTimeChange('dateIn', e.target.value)}
                            min={minDate}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-center">Date Out</label>
                          <input
                            type="date"
                            value={bulkDateTime.dateOut}
                            onChange={(e) => handleBulkDateTimeChange('dateOut', e.target.value)}
                            min={minDate}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-center">Period Time</label>
                          <select
                            value={bulkDateTime.periodTime}
                            onChange={(e) => handleBulkDateTimeChange('periodTime', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="choose">Choose time</option>
                            <option value="9:00-12:00">9:00 - 12:00</option>
                            <option value="13:00-16:00">13:00 - 16:00</option>
                            <option value="9:00-16:00">9:00 - 16:00</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-center">&nbsp;</label>
                          <button
                            type="button"
                            onClick={handleAddAllSeats}
                            onMouseDown={(e) => e.preventDefault()}
                            className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-bold"
                          >
                            Add All
                          </button>
                        </div>
                      </div>
                      
                      
                    </div>
                  )}
                  
                  <p className="mt-4 text-gray-600 text-center font-semibold">
                    Total Selected: {selectedSeats.length} seat(s)
                  </p>
                </div>
              </div>
  
              {/* Booking Summary */}
  {selectedSeats.length > 0 && (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full">
      <h2 className="text-xl font-bold mb-4 text-center">Booking Summary</h2>
      
      <div className="mb-6 text-center">
        <p className="text-gray-700"><strong>Username:</strong> {username}</p>
        <p className="text-gray-700"><strong>Major:</strong> {major}</p>
        <p className="text-gray-700"><strong>Room:</strong> {selectedRoom.name}</p>
        <p className="text-gray-700"><strong>Total Seats:</strong> {selectedSeats.length}</p>
      </div>
  
      <div className="mb-6 overflow-x-auto">
        {/* Remove All Button - Positioned above the table */}
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={() => setSelectedSeats([])}
            className="text-red-600 hover:text-red-800 font-medium px-4 py-2 border border-red-600 rounded hover:bg-red-50 transition-colors"
          >
            Remove All
          </button>
        </div>
  
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-center">Seat ID</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Date In</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Date Out</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Period Time</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {selectedSeats.map((seatId) => (
              <tr key={seatId}>
                <td className="border border-gray-300 px-4 py-2 font-bold text-center">{seatId}</td>
                <td className="border border-gray-300 px-2 py-2">
                  <input
                    type="date"
                    value={dateTimeInputs[seatId]?.dateIn || ''}
                    onChange={(e) => handleDateTimeChange(seatId, 'dateIn', e.target.value)}
                    min={minDate}
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
                <td className="border border-gray-300 px-2 py-2">
                  <input
                    type="date"
                    value={dateTimeInputs[seatId]?.dateOut || ''}
                    onChange={(e) => handleDateTimeChange(seatId, 'dateOut', e.target.value)}
                    min={minDate}
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
                <td className="border border-gray-300 px-2 py-2">
                  <select
                    value={dateTimeInputs[seatId]?.periodTime || 'choose'}
                    onChange={(e) => handleDateTimeChange(seatId, 'periodTime', e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  >
                    <option value="choose">Choose</option>
                    <option value="9:00-12:00">9:00 - 12:00</option>
                    <option value="13:00-16:00">13:00 - 16:00</option>
                    <option value="9:00-16:00">9:00 - 16:00</option>
                  </select>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveSeat(seatId)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      
  
      <button
        type="button"
        onClick={handleBooking}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold"
      >
        Confirm Booking
      </button>
    </div>
  )}
            </>
          )}
        </div>
      </div>
    );
  }

export default AirplaneSeatBookingAdmin;
