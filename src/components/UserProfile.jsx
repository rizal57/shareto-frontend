import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AiOutlineLogout } from 'react-icons/ai';
import { GoogleLogout } from 'react-google-login';
import { client } from '../client';

import { userCreatedPinsQuery, userQuery, userSavedPinsQuery } from '../utils/data';
import Spinner from './Spinner';
import MasonryLayout from './MasonryLayout';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [pins, setPins] = useState(null);
  const [text, setText] = useState('Created');
  const [activeBtn, setActiveBtn] = useState('created');
  const navigate = useNavigate();
  const {userId} = useParams();

  const randomImage = 'http://source.unsplash.com/1600x900/?neature,photography.technology';
  const activeBtnStyles = 'transition-all duration-300 bg-red-500 text-white font-bold p-2 rounded-full w-20 outline-none';
  const notActiveBtnStyles = 'transition-all duration-300 bg-slate-20 mr-4 text-black font-bold p-2 rounded-full w-20 outline-none';

  useEffect(() => {
    const query = userQuery(userId);

    client.fetch(query)
      .then((data) => {
        setUser(data[0]);
      })
  }, [userId])

  const logout = () => {
    localStorage.clear();

    navigate('/login');
  }

  useEffect(() => {
    if(text === 'Created') {
      const createdPinsQuery = userCreatedPinsQuery(userId);
      client.fetch(createdPinsQuery)
        .then((data) => {
          setPins(data);
        })
    } else {
      const savedPinsQuery = userSavedPinsQuery(userId);
      client.fetch(savedPinsQuery)
        .then((data) => {
          setPins(data);
        })
    }
  }, [text, userId])

  if(!user) {
    return <Spinner message={'Loading profile...'} />
  }

  return (
    <div className='relative p-2 justify-center items-center'>
      <div className='flex flex-col pb-5'>
        <div className='relative flex flex-col mb-7'>
          <div className='flex flex-col justify-center items-center'>
            <img
              src={randomImage}
              className='w-full h-[370px] 2xl:h-[510px] shadow-lg object-cover'
              alt="Banner Pic"
            />
            <img
              src={user.image}
              className='w-20 h-20 rounded-full -mt-10 shadow-xl object-cover'
              alt="user-pic"
            />
            <h1 className='font-bold text-3xl text-center mt-3'>
              {user.userName}
            </h1>
            <div className='absolute top-2 z-1 right-2'>
              {userId === user._id && (
                <GoogleLogout
                  clientId={process.env.REACT_APP_GOOGLE_API_TOKEN}
                  render={(renderProps) => (
                    <button
                      type="button"
                      className="bg-white p-2 rounded-full cursor-pointer outline-none shadow-md"
                      onClick={renderProps.onClick}
                      disabled={renderProps.disabled}
                    >
                      <AiOutlineLogout color='red' fontSize={21} />
                    </button>
                  )}
                  onLogoutSuccess={logout}
                  cookiePolicy="single_host_origin"
                />
              )}
            </div>
          </div>
          <div className='text-center mb-7'>
            <button
              type='button'
              onClick={(e) => {
                setText(e.target.textContent);
                setActiveBtn('created');
              }}
              className={`${activeBtn === 'created' ? activeBtnStyles : notActiveBtnStyles}`}
            >
              Created
            </button>
            <button
              type='button'
              onClick={(e) => {
                setText(e.target.textContent);
                setActiveBtn('saved');
              }}
              className={`${activeBtn === 'saved' ? activeBtnStyles : notActiveBtnStyles}`}
            >
              Saved
            </button>
          </div>

          {pins?.length ? (
            <div className='px-2'>
              <MasonryLayout pins={pins} />
            </div>
          ) : (
            <div className='w-full text-xl font-bold flex items-center justify-center'>
              Pins not found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
