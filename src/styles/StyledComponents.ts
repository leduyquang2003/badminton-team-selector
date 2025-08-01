import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

// Animations
export const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -20px, 0);
  }
  70% {
    transform: translate3d(0, -10px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
`;

export const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

export const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Layout Components
export const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  color: #333;
`;

export const Header = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const MainContent = styled.main`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

// Button Components
export const PrimaryButton = styled(motion.button)`
  background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const SecondaryButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  border: 2px solid #667eea;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #667eea;
    color: white;
    transform: translateY(-1px);
  }
`;

// Card Components
export const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  animation: ${slideIn} 0.5s ease-out;
`;

export const PlayerCard = styled(Card)<{ $skillColor: string; $isSelected?: boolean }>`
  cursor: pointer;
  border: 3px solid ${props => props.$isSelected ? props.$skillColor : 'transparent'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

export const TeamCard = styled(Card)`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 240, 255, 0.95));
  border-left: 5px solid #4ECDC4;
`;

// Grid Layouts
export const PlayersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

export const TeamsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Player Components
export const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const PlayerAvatar = styled.div<{ $color: string }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  animation: ${pulse} 2s infinite;
`;

export const PlayerDetails = styled.div`
  flex: 1;
`;

export const PlayerName = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #333;
`;

export const SkillBadge = styled.span<{ $color: string }>`
  background: ${props => props.$color};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-right: 0.5rem;
`;

export const WinRateDisplay = styled.div`
  text-align: right;
  font-size: 0.9rem;
  color: #666;
`;

// Form Components
export const FormContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

export const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

export const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

export const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
`;

export const CheckboxLabel = styled.label`
  margin: 0;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
`;

export const CheckboxDescription = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
  margin-left: 1.5rem;
  line-height: 1.4;
`;

// Navigation
export const NavContainer = styled.nav`
  display: flex;
  gap: 1rem;
`;

export const NavButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? '#667eea' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#667eea'};
  border: 2px solid #667eea;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: #667eea;
    color: white;
  }
`;

// Loading and Empty States
export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 2rem auto;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1rem;
    line-height: 1.6;
  }
`;

// Team Generation Animation
export const TeamGenerationContainer = styled(motion.div)`
  text-align: center;
  padding: 3rem;
`;

export const GeneratingText = styled(motion.h2)`
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 2rem;
`;

export const ShuffleAnimation = styled(motion.div)`
  font-size: 4rem;
  animation: ${bounce} 2s infinite;
`;
