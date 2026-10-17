import NotificationsPage from '../../pages/NotificationsPage';

const TbiManagerNotificationsPage = () => {
  // Committee Leads can explain Overdue alerts from the Overdue notification itself (UC-4.4)
  return <NotificationsPage canExplainOverdue />;
};

export default TbiManagerNotificationsPage;
