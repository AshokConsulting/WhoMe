'use client';
import { useSearchParams } from 'next/navigation';

export default function MenuPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const userName = searchParams.get('userName');
  const isGuest = !userId;
  
  return (
    <div>
      <h1>Menu</h1>
      <p>UserId: {userId}</p>
      <p>UserName: {userName}</p>
      <p>Is Guest: {isGuest ? 'Yes' : 'No'}</p>
    </div>
  );
}