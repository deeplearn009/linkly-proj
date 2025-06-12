import React from 'react'
import FriendRequests from "./FriendRequests.jsx";
import MessagesList from "./MessagesList.jsx";

const Widgets = () => {
    return (
        <section className={'widgets'}>
            <FriendRequests />
            <MessagesList/>
        </section>
    )
}
export default Widgets
