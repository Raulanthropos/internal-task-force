import { useQuery, gql } from 'urql';
import { useEffect } from 'react';

const GET_UNREAD_NOTIFICATIONS = gql`
  query GetUnreadNotifications {
    getUnreadNotifications {
      id
      message
      isRead
      createdAt
    }
  }
`;

export function useNotifications() {
  const [{ data, fetching, error }, reexecute] = useQuery({
    query: GET_UNREAD_NOTIFICATIONS,
    requestPolicy: 'network-only',
  });

  useEffect(() => {
    // Poll every 60 seconds
    const interval = setInterval(() => {
      reexecute({ requestPolicy: 'network-only' });
    }, 60000);

    return () => clearInterval(interval);
  }, [reexecute]);

  return { notifications: data?.getUnreadNotifications || [], fetching, error, refetch: reexecute };
}
