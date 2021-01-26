import React from 'react';
import UsersList from '../components/UsersList';

const Users = () => {
    const USERS = [
        {
            id: 'u1',
            name: 'Sara',
            image: 'https://icons.iconarchive.com/icons/hopstarter/face-avatars/256/Female-Face-FG-5-brunette-icon.png',
            places: 3
        }
    ]
    return <UsersList items={USERS} />;
}

export default Users;