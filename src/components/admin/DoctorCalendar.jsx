import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Select, DatePicker, Card, Typography, Button, Tooltip, Badge, Modal, Descriptions } from 'antd';
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

const DoctorCalendar = () => {
  const { user } = useUser();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [dateRange, setDateRange] = useState([dayjs(), dayjs().add(30, 'days')]);
  const [appointments, setAppointments] = useState([]);
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && dateRange) {
      fetchAppointments();
    }
  }, [selectedDoctor, dateRange]);

  const fetchDoctors = async () => {
    try {
      const response = await doctorStatsHelper.getDoctorsList();
      setDoctors(response.data);
      
      // If user is a doctor, automatically select their ID
      if (user?.role === 'doctor') {
        setSelectedDoctor(user._id);
      }
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
    // Only allow doctor change if user is admin
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
    console.log("event ", event)

    return (
      <div
        style={{
          padding: '4px',
          backgroundColor: isOnline ? '#e6f7ff' : '#f6ffed',
          border: isCurrentTimeNear ? '2px solid #1890ff' : isOnline ? '2px solid #1890ff' : '2px solid #52c41a',
          borderRadius: '4px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#222',
          fontWeight: 500,
        }}
      >
        <div>
          <div style={{ fontWeight: 'bold', color: '#222' }}>{event.title}</div>
          <div style={{ fontSize: '0.8em', display: 'flex', alignItems: 'center', gap: '4px', color: '#222' }}>
            <ClockCircleOutlined /> {format(event.start, 'h:mm a')}
          </div>
        </div>
        <div style={{ fontSize: '0.8em', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', color: isOnline ? '#1890ff' : '#52c41a' }}>
          {isOnline ? (
            <>
              <DesktopOutlined /> Online
              {hasMeetLink && (
                <Button
                  type="link"
                  icon={<VideoCameraOutlined />}
                  size="small"
                  style={{ padding: 0, marginLeft: 4 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(event.appointment.meetLink, '_blank');
                  }}
                >
                  Dołącz
                </Button>
              )}
            </>
          ) : (
            <>
              <UserOutlined /> Offline
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
        title="Szczegóły wizyty"
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
              Dołącz do spotkania
            </Button>
          ),
          <Button key="close" onClick={onClose}>
            Zamknij
          </Button>
        ]}
      >
        <Descriptions column={1}>
          <Descriptions.Item label="Pacjent">{appointment.patientName}</Descriptions.Item>
          <Descriptions.Item label="Wiek">
            {appointment.age ? `${appointment.age} lat` : 'Nie podano'}
          </Descriptions.Item>
          <Descriptions.Item label="Płeć">
            {appointment.gender === 'Male' ? 'Mężczyzna' : 
             appointment.gender === 'Female' ? 'Kobieta' : 
             appointment.gender === 'Others' ? 'Inna' : 'Nie podano'}
          </Descriptions.Item>
          <Descriptions.Item label="Godzina">
            {appointment.appointmentTime}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {appointment.status === 'booked' ? 'Zarezerwowana' : appointment.status}
          </Descriptions.Item>
          <Descriptions.Item label="Tryb wizyty">
            {appointment.mode === 'online' ? 'Online' : 'W gabinecie'}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={4}>Kalendarz lekarza</Title>
        <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
          {(user?.role === 'admin' || user?.role === 'receptionist') && (
            <Select
              style={{ width: '300px' }}
              placeholder="Wybierz lekarza"
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
          />
        </div>
        <div style={{ height: '700px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
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
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.appointment.mode === 'online' ? '#e6f7ff' : '#f6ffed',
                borderColor: event.appointment.mode === 'online' ? '#1890ff' : '#52c41a',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderRadius: '4px',
                color: '#222',
                fontWeight: 500,
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