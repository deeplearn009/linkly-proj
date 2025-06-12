import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
  text-align: center;
`;

const ErrorCode = styled(motion.h1)`
  font-size: 8rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const ErrorMessage = styled(motion.p)`
  font-size: 1.5rem;
  color: #4a5568;
  margin: 1rem 0 2rem;
  max-width: 600px;
`;

const HomeButton = styled(motion.button)`
  padding: 1rem 2rem;
  font-size: 1.1rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #3182ce;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <ErrorContainer>
      <ErrorCode
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        404
      </ErrorCode>
      <ErrorMessage
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Oops! Looks like you've ventured into uncharted territory.
        The page you're looking for doesn't exist or has been moved.
      </ErrorMessage>
      <HomeButton
        onClick={() => navigate('/')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Return Home
      </HomeButton>
    </ErrorContainer>
  );
};

export default ErrorPage;
