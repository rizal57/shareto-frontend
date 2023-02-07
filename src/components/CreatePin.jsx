import React, { useState } from 'react';
import Spinner from './Spinner';
import { useNavigate } from 'react-router-dom';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import {categories} from '../utils/data';
import { client } from '../client';
import { MdDelete } from 'react-icons/md';
import { fetchUser } from '../utils/fetchUser';

const CreatePin = () => {
  const [title, setTitle] = useState('');
  const [about, setAbout] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState(false);
  const [category, setCategory] = useState(null);
  const [imageAsset, setImageAsset] = useState(null);
  const [wrongImageType, setWrongImageType] = useState(null);

  const user = fetchUser();

  const navigate = useNavigate();

  const uploadImage = (e) => {
    const { type, name } = e.target.files[0]

    if(type === 'image/png' || type === 'image/svg' || type === 'image/jpg' || type === 'image/giff' || type === 'image/jpeg' || type === 'image/tiff') {
      setWrongImageType(false);
      setLoading(true);

      client.assets
        .upload('image', e.target.files[0], {contentType: type, filename: name})
        .then((document) => {
          setImageAsset(document);
          setLoading(false);
        })
        .catch((error) => {
          console.log('Image upload error ', error)
        })
    } else {
      setWrongImageType(true);
    }
  }

  const savePin = () => {
    if(title && about && destination && imageAsset?._id && category) {
      const doc = {
        _type: 'pin',
        title,
        about,
        destination,
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset?._id
          }
        },
        userId: user._id,
        postedBy: {
          _type: 'postedBy',
          _ref: user._id,
        },
        category
      }
      client.create(doc)
        .then(() => {
          navigate('/')
        })
    } else {
      setFields(true);
      setTimeout(() => setFields(false), 2000)
    }
  }

  return (
    <div className='flex flex-col justify-center items-center'>
      {fields && (
        <p className='text-red-500 text-base transition-all duration-300'>Please fill in all the fields.</p>
      )}
      <div className='flex flex-col lg:flex-row justify-center items-center rounded-lg bg-white lg:p-5 p-3 lg:w-4/5 w-full'>
        <div className='bg-slate-300 p-3 flex flex-0.7 w-full rounded-lg'>
          <div className='flex justify-center items-center flex-col rounded-lg border-2 border-dotted border-gray-200 p-3 w-full h-[420px]'>
            {loading && <Spinner />}
            {wrongImageType && <p>Wrong image type.</p>}
            {!imageAsset ? (
              <label>
                <div className='flex flex-col items-center justify-center h-full'>
                  <div className='flex flex-col items-center justify-center'>
                    <p className='font-bold text-2xl'>
                      <AiOutlineCloudUpload />
                    </p>
                    <p className='text-lg'>Click to upload</p>
                    <div className='mt-32 text-gray-400 text-center'>
                      Use high qulity JPG, SVG, PNG, GIF or TIFF less then 20 mb
                    </div>
                    <input
                      type="file"
                      name='upload-image'
                      onChange={uploadImage}
                      className='w-0 h-0'
                    />
                  </div>
                </div>
              </label>
            ) : (
              <div className='relative h-full'>
                <img src={imageAsset?.url} alt="Upload pic" className='h-full w-full md:w-auto md:h-auto md:mt-20 rounded-lg object-cover' />
                <button
                  type='button'
                  className='absolute bg-white bottom-3 right-3 p-3 rounded-full text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-300 ease-in-out'
                  onClick={() => setImageAsset(null)}
                >
                  <MdDelete />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className='flex flex-1 flex-col gap-6 lg:pl-5 mt-5 w-full'>
          <input
            type="text"
            placeholder='Add your title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className='outline-none text-2xl sm:text-3xl font-bold borde-b-2 border-gray-200 p-2'
          />
          {user && (
            <div className='flex items-center gap-2 my-2'>
              <img
                src={user?.imageUrl}
                alt="user-profile"
                className='w-9 h-9 rounded-full shadow-md'
              />
              <p className='font-semibold text-slate-800'>{user?.name}</p>
            </div>
          )}
          <input
            type="text"
            placeholder='What is your pin about'
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className='outline-none text-base sm:text-lg borde-b-2 border-gray-200 p-2'
          />
          <input
            type="text"
            placeholder='Add a destination lilnk'
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className='outline-none text-base sm:text-lg borde-b-2 border-gray-200 p-2'
          />
          <div className='flex flex-col'>
            <div>
              <p className='mb-2 font-semibold text-lg sm:text-xl'>Choose Pin Category</p>
              <select
                onChange={(e) => setCategory(e.target.value)}
                className='outline-none w-4/5 text-base border-b-2 border-gray-200 p-2 rounded-md cursor-pointer'
              >
                <option value="other" className='bg-white'>Select Category</option>
                {categories.map((category) => (
                  <option className='border-0 text-base p-2 outline-none capitalize bg-white text-black' key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex items-end justify-end mt-4'>
              <button
                type='button'
                onClick={savePin}
                className='bg-red-500 hover:bg-red-600 transition-all duration-300 ease-in-out outline-none text-white font-bold py-2 px-8 rounded-full'
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePin;
