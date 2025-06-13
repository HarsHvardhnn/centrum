import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import pl from 'date-fns/locale/pl';
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
  'pl': pl,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const messages = {
  allDay: 'Cały dzień',
  previous: 'Poprzedni',
  next: 'Następny',
  today: 'Dziś',
  month: 'Miesiąc',
  week: 'Tydzień',
  day: 'Dzień',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Czas',
  event: 'Wydarzenie',
  noEventsInRange: 'Brak wydarzeń w tym zakresie',
  showMore: (total) => `+${total} więcej`,
  work_week: 'Tydzień roboczy',
  day_header: 'Nagłówek dnia',
  week_header: 'Nagłówek tygodnia',
  month_header: 'Nagłówek miesiąca',
  agenda_header: 'Nagłówek agendy',
  date_range: 'Zakres dat',
  time_range: 'Zakres czasu',
  event_range: 'Zakres wydarzeń',
  all_day: 'Cały dzień',
  more: 'Więcej',
  no_events: 'Brak wydarzeń',
  loading: 'Ładowanie...',
  select: 'Wybierz',
  event_click: 'Kliknij wydarzenie',
  event_double_click: 'Podwójne kliknięcie wydarzenia',
  event_key_press: 'Naciśnij klawisz wydarzenia',
  event_key_down: 'Naciśnij klawisz w dół',
  event_key_up: 'Naciśnij klawisz w górę',
  event_key_enter: 'Naciśnij klawisz Enter',
  event_key_escape: 'Naciśnij klawisz Escape',
  event_key_space: 'Naciśnij klawisz Spacja',
  event_key_delete: 'Naciśnij klawisz Delete',
  event_key_backspace: 'Naciśnij klawisz Backspace',
  event_key_tab: 'Naciśnij klawisz Tab',
  event_key_shift: 'Naciśnij klawisz Shift',
  event_key_ctrl: 'Naciśnij klawisz Ctrl',
  event_key_alt: 'Naciśnij klawisz Alt',
  event_key_meta: 'Naciśnij klawisz Meta',
  event_key_win: 'Naciśnij klawisz Windows',
  event_key_cmd: 'Naciśnij klawisz Command',
  event_key_option: 'Naciśnij klawisz Option',
  event_key_arrow_left: 'Naciśnij klawisz strzałki w lewo',
  event_key_arrow_right: 'Naciśnij klawisz strzałki w prawo',
  event_key_arrow_up: 'Naciśnij klawisz strzałki w górę',
  event_key_arrow_down: 'Naciśnij klawisz strzałki w dół',
  event_key_page_up: 'Naciśnij klawisz Page Up',
  event_key_page_down: 'Naciśnij klawisz Page Down',
  event_key_home: 'Naciśnij klawisz Home',
  event_key_end: 'Naciśnij klawisz End',
  event_key_insert: 'Naciśnij klawisz Insert',
  event_key_delete_forward: 'Naciśnij klawisz Delete Forward',
  event_key_delete_backward: 'Naciśnij klawisz Delete Backward',
  event_key_clear: 'Naciśnij klawisz Clear',
  event_key_help: 'Naciśnij klawisz Help',
  event_key_pause: 'Naciśnij klawisz Pause',
  event_key_break: 'Naciśnij klawisz Break',
  event_key_print_screen: 'Naciśnij klawisz Print Screen',
  event_key_scroll_lock: 'Naciśnij klawisz Scroll Lock',
  event_key_num_lock: 'Naciśnij klawisz Num Lock',
  event_key_caps_lock: 'Naciśnij klawisz Caps Lock',
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
            <ClockCircleOutlined /> {format(event.start, 'HH:mm')}
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
              <UserOutlined /> W gabinecie
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
            {appointment.status === 'booked' ? 'Zarezerwowana' : 
             appointment.status === 'completed' ? 'Zakończona' :
             appointment.status === 'cancelled' ? 'Anulowana' : appointment.status}
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
            locale={{
              lang: {
                locale: 'pl',
                today: 'Dziś',
                now: 'Teraz',
                backToToday: 'Powrót do dziś',
                ok: 'OK',
                clear: 'Wyczyść',
                month: 'Miesiąc',
                year: 'Rok',
                timeSelect: 'Wybierz czas',
                dateSelect: 'Wybierz datę',
                monthSelect: 'Wybierz miesiąc',
                yearSelect: 'Wybierz rok',
                decadeSelect: 'Wybierz dekadę',
                yearFormat: 'YYYY',
                dateFormat: 'D/M/YYYY',
                dayFormat: 'D',
                dateTimeFormat: 'D/M/YYYY HH:mm:ss',
                monthFormat: 'MMMM',
                monthBeforeYear: true,
                previousMonth: 'Poprzedni miesiąc (PageUp)',
                nextMonth: 'Następny miesiąc (PageDown)',
                previousYear: 'Poprzedni rok (Control + left)',
                nextYear: 'Następny rok (Control + right)',
                previousDecade: 'Poprzednia dekada',
                nextDecade: 'Następna dekada',
                previousCentury: 'Poprzedni wiek',
                nextCentury: 'Następny wiek',
              },
            }}
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
            formats={{
              weekdayFormat: (date) => format(date, 'EEEE', { locale: pl }),
              dayFormat: (date) => format(date, 'd EEE', { locale: pl }),
              timeGutterFormat: (date) => format(date, 'HH:mm', { locale: pl }),
              eventTimeRangeFormat: ({ start, end }) =>
                `${format(start, 'HH:mm', { locale: pl })} - ${format(end, 'HH:mm', { locale: pl })}`,
              dayRangeHeaderFormat: ({ start, end }) =>
                `${format(start, 'd MMMM', { locale: pl })} - ${format(end, 'd MMMM', { locale: pl })}`,
            }}
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