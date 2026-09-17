import { NavigatorScreenParams } from '@react-navigation/native';
import { createNavigationContainerRef } from '@react-navigation/native';

export type MainTabParamList = {
  Browse: undefined;
  Bookings: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateToMainTab(tab: keyof MainTabParamList) {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate('Main', { screen: tab });
}
