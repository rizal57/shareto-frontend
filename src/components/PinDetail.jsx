import React, { useEffect, useState } from 'react';
import { MdDownloadForOffline } from 'react-icons/md';
import MasonryLayout from './MasonryLayout';
import { v4 as uuidv4 } from 'uuid';
import Spinner from './Spinner';
import { Link, useParams } from 'react-router-dom';
import { pinDetailMorePinQuery, pinDetailQuery } from '../utils/data';
import { client, urlFor } from '../client';

const PinDetail = ({ user }) => {
  const [pins, setPins] = useState(null);
  const [pinDetail, setPinDetail] = useState(null);
  const [comment, setComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const { pinId } = useParams();

  const fetchPinDetail = () => {
    const query = pinDetailQuery(pinId);
    if(query) {
      client.fetch(query)
        .then((data) => {
          setPinDetail(data[0]);

          if(data[0]) {
            const query1 = pinDetailMorePinQuery(data[0]);
            client.fetch(query1)
              .then((res) => setPins(res));
          }
        })
    }
  }

  useEffect(() => {
    fetchPinDetail();
  }, [pinId])

  const addComment = () => {
    if(comment) {
      setAddingComment(true);

      client
        .patch(pinId)
        .setIfMissing({comments: []})
        .insert('after', 'comments[-1]', [{
          comment,
          _key: uuidv4(),
          postedBy: {
            _type: 'postedBy',
            _ref: user._id
          }
        }])
        .commit()
        .then(() => {
          fetchPinDetail();
          setComment('');
          setAddingComment(false);
        })
    }
  }

  if(!pinDetail) return <Spinner message={'Loading pin...'}/>

  return (
    <div className='felx xl:flex-row flex-col m-auto bg-white max-w-[1500px] rounded-[32px] p-4'>
      <div className='flex justify-center items-center md:items-start flex-initial'>
        <img
          src={pinDetail?.image && urlFor(pinDetail.image.asset.url)}
          alt="user-post"
          className='rounded-t-3xl rounded-b-lg'
        />
      </div>
      <div className='w-full p-5 flex-1 xl:min-w-[620px]'>
        <div className='flex items-center justify-between'>
          <div className="flex gap-2 items-center">
            <a
              href={`${pinDetail.image?.asset?.url}?dl=`}
              download
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-9 h-9 flex items-center justify-center rounded-full text-slate-900 text-xl opacity-75 hover:opacity-100 outline-none hover:shadow-md transition-all duration-300 ease-in-out"
            >
              <MdDownloadForOffline />
            </a>
          </div>
          <a href={pinDetail.destination} target='_blank' rel='noreferrer'>{pinDetail.destination}</a>
        </div>
        <div>
          <h1 className='md:text-4xl text-2xl font-bold break-words mt-3'>{pinDetail.title}</h1>
          <p className='mt-3'>{pinDetail.about}</p>
        </div>
        <Link to={`/user-profile/${pinDetail.postedBy._id}`} className='mt-5 flex items-center gap-2 bg-white rounded-lg'>
          <img src={pinDetail.postedBy?.image} alt="user-profile" className='w-8 h-8 rounded-full object-cover' />
          <p className='font-semibold text-slate-600'>{pinDetail.postedBy?.userName}</p>
        </Link>
        <h2 className='mt-5 text-2xl'>Comments</h2>
        <div className='max-h-[370px] overflow-y-auto'>
          {pinDetail?.comments?.map((comment, i) => (
            <div key={i} className='flex gap-2 mt-5 items-center bg-white rounded-lg'>
              <img
                src={comment.postedBy.image}
                alt="user-profile"
                className='h-10 w-10 rounded-full cursor-pointer'
              />
              <div className='flex flex-col'>
                <p className='flex font-bold'>{comment.postedBy.userName}</p>
                <p>{comment.comment}</p>
              </div>
            </div>
          ))}
        </div>
        <div className='flex flex-wrap mt-6 gap-3'>
          <Link to={`/user-profile/${pinDetail.postedBy._id}`}>
            <img src={user?.image} alt="user-profile" className='w-10 h-10 rounded-full cursor-pointer' />
          </Link>
          <input
            type="text"
            className='flex-1 border-gray-100 outline-none border-2 p-2 rounded-2xl focus:border-gray-300'
            placeholder='Add a comment'
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            type='button'
            className='bg-red-500 text-white font-semibold rounded-full px-6 py-2'
            onClick={addComment}
          >
            {addingComment ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinDetail;
