import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Select, DatePicker, Card, Typography, Button, Tooltip, Badge, Modal, Descriptions } from 'antd';
import antdDatePickerEn from 'antd/es/date-picker/locale/en_US';

// Custom CSS to improve calendar appearance
const calendarStyles = `
  .rbc-time-slot {
    min-height: 60px !important;
  }
  .rbc-event {
    min-height: 60px !important;
    margin: 2px 4px !important;
  }
  .rbc-time-content {
    min-height: 60px !important;
  }
  .rbc-timeslot-group {
    min-height: 60px !important;
  }
  .rbc-time-gutter {
    min-height: 60px !important;
  }
  .rbc-time-header {
    min-height: 60px !important;
  }
  .rbc-time-header-content {
    min-height: 60px !important;
  }
  .rbc-time-header-cell {
    min-height: 60px !important;
  }
  .rbc-time-header-cell-single-day {
    min-height: 60px !important;
  }
  .rbc-time-header-cell-multi-day {
    min-height: 60px !important;
  }
  .rbc-time-header-cell-single-day + .rbc-time-header-cell-single-day {
    min-height: 60px !important;
  }
  .rbc-time-header-cell-multi-day + .rbc-time-header-cell-multi-day {
    min-height: 60px !important;
  }
  .rbc-time-header-cell-single-day + .rbc-time-header-cell-multi-day {
    min-height: 60px !important;
  }
  .rbc-time-header-cell-multi-day + .rbc-time-header-cell-single-day {
    min-height: 60px !important;
  }
  .rbc-time-header-cell-single-day + .rbc-time-header-cell-single-day + .rbc-time-header-cell-single-day {
    min-height: 60px !important;
  }
  .rbc-time-header-cell-single-day + .rbc-time-header-cell-single-day + .rbc-time-header-cell-multi-day {
    min-height: 60px !important;
  }
  .rbc-time-header-cell-single-day + .rbc-time-header-cell-multi-day + .rbc-time-header-cell-single-day {
    min-height: 60px !important;
  }
  .rbc-time-header-cell-single-day + .rbc-time-header-cell-multi-day + .rbc-time-header-cell-multi-day {
    min-height: 60px !important;
  }
  .rbc-time-header-cell-multi-day + .rbc-time-header-cell-single-day + .rbc-time-header-cell-single-day {
    min-height: 60px !important;
  }
  .rbc-time-header-cell-multi-day + .rbc-time-header-cell-single-day + .rbc-time-header-cell-multi-day {
    min-height: 60px !important;
  }
  .rbc-time-header-cell-multi-day + .rbc-time-header-cell-multi-day + .rbc-time-header-cell-single-day {
    min-height: 60px !important;
  }
  .rbc-time-header-cell-multi-day + .rbc-time-header-cell-multi-day + .rbc-time-header-cell-multi-day {
    min-height: 60px !important;
  }
`;
import { VideoCameraOutlined, ClockCircleOutlined, DesktopOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiCaller } from '../../utils/axiosInstance';
import doctorStatsHelper from '../../helpers/doctorStatsHelper';
import { useUser } from '../../context/userContext';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const messages = {
  allDay: 'All day',
  previous: 'Previous',
  next: 'Next',
  today: 'Today',
  month: 'Month',
  week: 'Week',
  day: 'Day',
  agenda: 'Agenda',
  date: 'Date',
  time: 'Time',
  event: 'Event',
  noEventsInRange: 'No events in this range',
  showMore: (total) => `+${total} more`,
  work_week: 'Work week',
  more: 'More',
  no_events: 'No events',
  loading: 'Loading...',
};

const DoctorCalendar = () => {
  const { user } = useUser();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(user?.role === 'doctor' ? user.id : null);
  const [dateRange, setDateRange] = useState([dayjs(), dayjs().add(30, 'days')]);
  const [appointments, setAppointments] = useState([]);
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (user?.role !== 'doctor') {
      fetchDoctors();
    }
  }, [user]);

  useEffect(() => {
    //("selectedDoctor", selectedDoctor)
    if (selectedDoctor && dateRange) {
      fetchAppointments();
    }
  }, [selectedDoctor, dateRange]);

  const fetchDoctors = async () => {
    try {
      const response = await doctorStatsHelper.getDoctorsList();
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const [startDate, endDate] = dateRange;
      const response = await apiCaller(
        'GET',
        `/appointments/doctor/${selectedDoctor}/by-date?startDate=${startDate.format('YYYY-MM-DD')}&endDate=${endDate.format('YYYY-MM-DD')}`
      );
      setAppointments(response.data.data);
      formatAppointmentsToEvents(response.data.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const formatAppointmentsToEvents = (appointmentsData) => {
    const formattedEvents = appointmentsData.flatMap((dayData) =>
      dayData.appointments.map((appointment) => {
        const [hours, minutes] = appointment.appointmentTime.split(':');
        const eventDate = new Date(dayData.date);
        eventDate.setHours(parseInt(hours), parseInt(minutes));

        return {
          id: appointment.appointmentId,
          title: appointment.patientName,
          start: eventDate,
          end: new Date(eventDate.getTime() + 30 * 60000), // 30 minutes duration
          appointment,
        };
      })
    );
    setEvents(formattedEvents);
  };

  const handleDoctorChange = (value) => {
    if (user?.role === 'admin' || user?.role === 'receptionist') {
      setSelectedDoctor(value);
    }
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const handleEventClick = (event) => {
    setSelectedAppointment(event.appointment);
    setIsModalVisible(true);
  };

  // Handler for calendar navigation (next, prev, today)
  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  const EventComponent = ({ event }) => {
    const isCurrentTimeNear = Math.abs(new Date().getTime() - event.start.getTime()) < 30 * 60000; // Within 30 minutes
    const isOnline = event.appointment.mode === 'online';
    const hasMeetLink = event.appointment.meetLink;

    return (
      <div
        style={{
          padding: '8px',
          backgroundColor: isOnline ? '#e6f7ff' : '#f6ffed',
          border: isCurrentTimeNear ? '2px solid #1890ff' : isOnline ? '2px solid #1890ff' : '2px solid #52c41a',
          borderRadius: '6px',
          height: '100%',
          minHeight: '60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#222',
          fontWeight: 500,
          fontSize: '12px',
          lineHeight: '1.3',
        }}
      >
        <div>
          <div style={{ 
            fontWeight: 'bold', 
            color: '#222',
            fontSize: '13px',
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {event.title}
          </div>
          <div style={{ 
            fontSize: '11px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            color: '#666',
            marginBottom: '4px'
          }}>
            <ClockCircleOutlined /> {format(event.start, 'HH:mm')}
          </div>
        </div>
        <div style={{ 
          fontSize: '11px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px', 
          marginTop: '4px', 
          color: isOnline ? '#1890ff' : '#52c41a',
          flexWrap: 'wrap'
        }}>
          {isOnline ? (
            <>
              <DesktopOutlined /> Online
              {hasMeetLink && (
                <Button
                  type="link"
                  icon={<VideoCameraOutlined />}
                  size="small"
                  style={{ padding: 0, marginLeft: 4, fontSize: '10px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(event.appointment.meetLink, '_blank');
                  }}
                >
                  Join
                </Button>
              )}
            </>
          ) : (
            <>
              <UserOutlined /> In office
            </>
          )}
        </div>
      </div>
    );
  };

  const AppointmentModal = ({ appointment, visible, onClose }) => {
    if (!appointment) return null;

    return (
      <Modal
        title="Appointment details"
        open={visible}
        onCancel={onClose}
        footer={[
          appointment.meetLink && (
            <Button
              key="meet"
              type="primary"
              icon={<VideoCameraOutlined />}
              onClick={() => window.open(appointment.meetLink, '_blank')}
            >
              Join meeting
            </Button>
          ),
          <Button key="close" onClick={onClose}>
            Close
          </Button>
        ]}
      >
        <Descriptions column={1}>
          <Descriptions.Item label="Patient">{appointment.patientName}</Descriptions.Item>
          <Descriptions.Item label="Age">
            {appointment.age ? `${appointment.age} years` : 'Not provided'}
          </Descriptions.Item>
          <Descriptions.Item label="Sex">
            {appointment.gender === 'Male' ? 'Male' : 
             appointment.gender === 'Female' ? 'Female' : 
             appointment.gender === 'Others' ? 'Other' : 'Not provided'}
          </Descriptions.Item>
          <Descriptions.Item label="Time">
            {appointment.appointmentTime}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {appointment.status === 'booked' ? 'Booked' : 
             appointment.status === 'completed' ? 'Completed' :
             appointment.status === 'cancelled' ? 'Cancelled' : appointment.status}
          </Descriptions.Item>
          <Descriptions.Item label="Visit mode">
            {appointment.mode === 'online' ? 'Online' : 'In office'}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <style>{calendarStyles}</style>
      <Card>
        <Title level={4}>Doctor calendar</Title>
        <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
          {(user?.role === 'admin' || user?.role === 'receptionist') && (
            <Select
              style={{ width: '300px' }}
              placeholder="Select a doctor"
              onChange={handleDoctorChange}
              value={selectedDoctor}
            >
              {doctors.map((doctor) => (
                <Select.Option key={doctor._id} value={doctor._id}>
                  {doctor.name}
                </Select.Option>
              ))}
            </Select>
          )}
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            style={{ width: '300px' }}
            locale={antdDatePickerEn}
          />
        </div>
        <div style={{ height: '700px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            messages={messages}
            culture="en-US"
            components={{
              event: EventComponent,
              week: { event: EventComponent },
              day: { event: EventComponent },
              month: { event: EventComponent },
              agenda: { event: EventComponent },
            }}
            onSelectEvent={handleEventClick}
            views={['week']}
            defaultView="week"
            date={currentDate}
            onNavigate={handleNavigate}
            step={30}
            timeslots={1}
            min={new Date(0, 0, 0, 8, 0, 0)}
            max={new Date(0, 0, 0, 20, 0, 0)}
            formats={{
              weekdayFormat: (date) => format(date, 'EEEE', { locale: enUS }),
              dayFormat: (date) => format(date, 'd EEE', { locale: enUS }),
              timeGutterFormat: (date) => format(date, 'HH:mm', { locale: enUS }),
              eventTimeRangeFormat: ({ start, end }) =>
                `${format(start, 'HH:mm', { locale: enUS })} - ${format(end, 'HH:mm', { locale: enUS })}`,
              dayRangeHeaderFormat: ({ start, end }) =>
                `${format(start, 'd MMMM', { locale: enUS })} - ${format(end, 'd MMMM', { locale: enUS })}`,
            }}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.appointment.mode === 'online' ? '#e6f7ff' : '#f6ffed',
                borderColor: event.appointment.mode === 'online' ? '#1890ff' : '#52c41a',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderRadius: '6px',
                color: '#222',
                fontWeight: 500,
                minHeight: '60px',
              },
            })}
          />
        </div>
      </Card>
      <AppointmentModal
        appointment={selectedAppointment}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </div>
  );
};

export default DoctorCalendar; 