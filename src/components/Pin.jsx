import React, { useState } from 'react';
import { client, urlFor } from '../client';
import { v4 as uuidv4 } from 'uuid';
import { MdDownloadForOffline } from 'react-icons/md';
import { MdDelete } from 'react-icons/md';
import { BsFillArrowUpRightCircleFill } from 'react-icons/bs';
import { Link, useNavigate } from 'react-router-dom';
import { fetchUser } from '../utils/fetchUser';

const Pin = ({ pin: { postedBy, image, _id, destination, save } }) => {
  const [postHovered, setPostHovered] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const navigate = useNavigate();
  const user = fetchUser();

  // prettier-ignore
  const alredySaved = !!(save?.filter((item) => item.postedBy._id === user.googleId))?.length;

  const savePin = (id) => {
    if (!alredySaved) {
      setSavingPost(true);

      client
        .patch(id)
        .setIfMissing({ save: [] })
        .insert('after', 'save[-1]', [
          {
            _key: uuidv4(),
            userId: user.googleId,
            postedBy: {
              _type: 'postedBy',
              _ref: user.googleId,
            },
          },
        ])
        .commit()
        .then(() => {
          window.location.reload();
          setSavingPost(false);
        });
    }
  };

  const deletePin = (id) => {
    client
      .delete(id)
      .then(() => {
        window.location.reload();
      })
  }

  return (
    <div className="m-2">
      <div
        onMouseEnter={() => setPostHovered(true)}
        onMouseLeave={() => setPostHovered(false)}
        onClick={() => navigate(`/pin-detail/${_id}`)}
        className="relative cursor-zoom-in w-auto hover:shadow-lg rounded-lg overflow-hidden transition-all duration-500 ease-in-out">
        <img className="w-full rounded-lg" src={urlFor(image).width(250).url()} alt="user-post" />
        {postHovered && (
          <div
            className="absolute top-0 w-full h-full flex flex-col justify-between p-1 pr-2 pt-2 pb-2 z-50"
            style={{ height: '100%' }}>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <a
                  href={`${image?.asset?.url}?dl=`}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white w-9 h-9 flex items-center justify-center rounded-full text-slate-900 text-xl opacity-75 hover:opacity-100 outline-none hover:shadow-md transition-all duration-300 ease-in-out">
                  <MdDownloadForOffline />
                </a>
              </div>
              {alredySaved ? (
                <button
                  type="button"
                  className="bg-red-500 opacity-70 hover:opacity-100 text-white px-5 py-1 font-bold teaxt-base rounded-3xl hover:shadow-md outline-none transition-all duration-300 ease-in-out">
                  {save?.length} Saved
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    savePin(_id);
                  }}
                  type="button"
                  className="bg-red-500 opacity-70 hover:opacity-100 text-white px-5 py-1 font-bold teaxt-base rounded-3xl hover:shadow-md outline-none transition-all duration-300 ease-in-out">
                  {savingPost ? 'Loading...' : 'Save'}
                </button>
              )}
            </div>
            <div className='flex justify-between items-center'>
              {destination && (
                <Link
                  to={destination}
                  target='_blank'
                  rel="noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className='py-0.5 flex items-center justify-center px-2 rounded-full bg-white opacity-75 hover:opacity-100 hover:shadow-md text-sm'
                >
                  <BsFillArrowUpRightCircleFill className='mr-1' />
                  {destination.slice(8, 20)}...
                </Link>
              )}
              {postedBy?._id === user.googleId && (
                <button
                  type='button'
                  className='p-1 rounded-full bg-white opacity-75 hover:opacity-100 hover:shadow-md text-base'
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePin(_id)
                  }}
                >
                  <MdDelete />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <div className='mt-2 flex items-center gap-2'>
        <img src={postedBy?.image} alt="user-profile" className='w-8 h-8 rounded-full object-cover' />
        <p className='font-semibold text-slate-600'>{postedBy?.userName}</p>
      </div>
    </div>
  );
};

export default Pin;
