import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, ImageBackground} from 'react-native';
import { Button, Input } from 'react-native-elements';
import { firestore } from '../Firebase';
import { Feather } from '@expo/vector-icons';

const Home = ({ navigation }) => {
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null);
    const [songs, setSongs] = useState([]);
    const [titleValue, setTitleValue] = useState('');
    const [lyricsValue, setLyricsValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const unsubscribe = firestore.collection('chansons').onSnapshot((snapshot) => {
            const songsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setSongs(songsData);
        });

        return () => unsubscribe();
    }, []);

    const toggleModal = (song) => {
        setSelectedSong(song);
        setModalVisible(!isModalVisible);
    };

    const handleTitleChange = (text) => {
        setTitleValue(text);
    };

    const handleLyricsChange = (text) => {
        setLyricsValue(text);
    };

    const handleSubmit = async () => {
        try {
            await firestore.collection('chansons').add({
                titre: titleValue,
                paroles: lyricsValue,
            });

            console.log('Chanson ajoutée avec succès à Firestore!');
            toggleModal(null);
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la chanson à Firestore:', error);
        }
    };

    const handleSearchChange = (text) => {
        setSearchTerm(text);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    return (
        <ImageBackground source={require('../assets/bethelBackground.png')} style={styles.backgroundImage}>

        <View style={styles.container}>
            <View style={styles.searchInputContainer}>
                <Feather name="search" size={20} color="#3498db" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher une chanson par titre"
                    onChangeText={handleSearchChange}
                    value={searchTerm}
                />
                {searchTerm.length > 0 && (
                    <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                        <Feather name="x" size={20} color="#2c3e50" />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={styles.scrollView}>
                {songs
                    .filter((song) => song.titre.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((song) => (
                        <TouchableOpacity
                            key={song.id}
                            onPress={() => toggleModal(song)}
                            style={styles.songButton}
                        >
                            <Text style={styles.songButtonText}>{song.titre}</Text>
                        </TouchableOpacity>
                    ))}
            </ScrollView>

            <Button
                title="Ajouter une chanson"
                onPress={() => toggleModal(null)}
                containerStyle={styles.addButtonContainer}
                buttonStyle={styles.addButton}
            />

            <Modal
                visible={isModalVisible}
                onRequestClose={() => toggleModal(null)}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    {selectedSong ? (
                        <>
                            <Text style={styles.modalTitle}>{selectedSong.titre}</Text>
                            <Text style={styles.lyricsText}>{selectedSong.paroles}</Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.modalTitle}>Ajouter une chanson</Text>
                            <Input
                                placeholder="Titre"
                                onChangeText={handleTitleChange}
                                value={titleValue}
                            />
                            <Input
                                placeholder="Paroles"
                                onChangeText={handleLyricsChange}
                                value={lyricsValue}
                                multiline={true}
                                inputStyle={styles.lyricsInput}
                            />
                            <Button
                                title="Ajouter"
                                onPress={handleSubmit}
                                containerStyle={styles.buttonContainer}
                                buttonStyle={styles.addButton}
                            />
                        </>
                    )}

                    <Button
                        title="Fermer"
                        onPress={() => toggleModal(null)}
                        containerStyle={styles.buttonContainer}
                        buttonStyle={styles.closeButton}
                    />
                </View>
            </Modal>
        </View>
        </ImageBackground>

    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
        width: '100%', // Assurez-vous que l'image couvre toute la largeur de l'écran
        height: '100%', // Assurez-vous que l'image couvre toute la hauteur de l'écran
    },

    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
    },
    searchInputContainer: {
        marginTop:50,

        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderColor: '#3498db',
        borderWidth: 1,
        paddingHorizontal: 10,
        marginBottom: 10,
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        color: '#2c3e50',
    },
    scrollView: {
        flex: 1,
        width: '90%',
    },
    songButton: {
        padding: 10,
        marginVertical: 5,
        backgroundColor: 'rgba(52,152,219,0.44)',
        borderRadius: 5,
    },
    songButtonText: {
        color: '#ecf0f1',
    },
    addButtonContainer: {
        width: '80%',
        marginBottom: 0,
    },
    addButton: {
        backgroundColor: '#27ae60',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ecf0f1',
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 10,
        color: '#2c3e50',
    },
    lyricsText: {
        textAlign: 'center',
        color: '#2c3e50',
    },
    lyricsInput: {
        height: 100,
        borderColor: '#3498db',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    buttonContainer: {
        marginVertical: 10,
        width: '80%',
    },
    closeButton: {
        backgroundColor: '#e74c3c',
    },
    clearButton: {
        marginLeft: 10,
    },
});

export default Home;
