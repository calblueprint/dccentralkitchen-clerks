import React from 'react';
import { AsyncStorage, Linking, TouchableOpacity, View } from 'react-native';
import { Title } from '../components/BaseComponents';
import Colors from '../constants/Colors';

class DrawerContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clerkName: '',
    };
  }

  async componentDidMount() {
    const clerkName = await AsyncStorage.getItem('clerkName');
    this.setState({ clerkName });
  }

  _logout = async () => {
    AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  };

  render() {
    return (
      <View
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
        }}>
        <View
          style={{
            backgroundColor: Colors.black,
            height: 114,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-end',
            padding: 16,
          }}>
          <Title style={{ color: 'white' }}>{this.state.clerkName}</Title>
        </View>
        <TouchableOpacity
          style={{ padding: 16, paddingTop: 32 }}
          onPress={() => Linking.openURL('http://tiny.cc/ClerkGuide')}>
          <Title>Clerk Guide</Title>
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 16 }} onPress={() => Linking.openURL('http://tiny.cc/SubmitFeedbackClerk')}>
          <Title>Feedback</Title>
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 16 }} onPress={() => Linking.openURL('http://tiny.cc/ClerkFeedback')}>
          <Title>Report Issue</Title>
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-end',
            verticalAlign: 'bottom',
          }}>
          <TouchableOpacity style={{ paddingLeft: 16, paddingBottom: 21 }} onPress={() => this._logout()}>
            <Title>Logout</Title>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default DrawerContent;