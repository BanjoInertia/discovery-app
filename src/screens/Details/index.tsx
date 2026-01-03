import { View, Text, StyleSheet } from 'react-native'

export function Details() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Aqui serão os detalhes do filme!</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    }
});