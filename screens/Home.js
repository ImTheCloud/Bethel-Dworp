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
        const unsubscribe = firestore.collection('song').onSnapshot((snapshot) => {
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

    const handleSearchChange = (text) => {
        setSearchTerm(text);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    const handleSubmit = async () => {
        try {
            await firestore.collection('song').add({
                title: titleValue,
                lyrics: lyricsValue,
            });

            // Réinitialiser les valeurs des champs
            setTitleValue('');
            setLyricsValue('');

            toggleModal(null);
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la chanson à Firestore:', error);
        }
    };

    return (

        <View style={styles.container}>
            <View style={styles.searchInputContainer}>
                <Feather name="search" size={20} color="#3498db" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for a song by title"
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
                    .filter((song) => song && song.title && song.title.toLowerCase().includes(searchTerm.toLowerCase()))
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map((song) => (
                        <TouchableOpacity
                            key={song.id}  // Ajoutez une clé unique ici
                            onPress={() => toggleModal(song)}
                            style={styles.songButton}
                        >
                            <Text style={styles.songButtonText}>{song.title}</Text>
                        </TouchableOpacity>
                    ))}
            </ScrollView>

            <Button
                title="Add a song"
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
                            <ScrollView >
                                <Text style={styles.modalTitle}>{selectedSong.title}</Text>
                                <Text style={styles.lyricsText}>{selectedSong.lyrics}</Text>
                            </ScrollView>
                        </>
                    ) : (
                        <>
                            <Text style={styles.modalTitle}>Add a song</Text>
                            <Input
                                placeholder="Title"
                                onChangeText={handleTitleChange}
                                value={titleValue}
                            />
                            <ScrollView style={styles.lyricsScrollView}>
                                <TextInput
                                    placeholder="Lyrics"
                                    onChangeText={handleLyricsChange}
                                    value={lyricsValue}
                                    multiline={true}
                                    style={styles.lyricsInput}
                                />
                            </ScrollView>
                            <Button
                                title="Add"
                                onPress={handleSubmit}
                                containerStyle={styles.buttonContainer}
                                buttonStyle={styles.addButton}
                            />
                        </>
                    )}



                    <Button
                        title="Close"
                        onPress={() => toggleModal(null)}
                        containerStyle={styles.buttonContainer}
                        buttonStyle={styles.closeButton}
                    />
                </View>
            </Modal>
        </View>

    );
};

const styles = StyleSheet.create({
    infoButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },

    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
    },
    searchInputContainer: {
        marginTop: 50,
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
        backgroundColor: 'rgba(52,152,219,0.28)',
        borderRadius: 5,
    },
    songButtonText: {
        color: '#000000',
    },
    addButtonContainer: {
        width: '80%',
        marginBottom: 0,
    },
    addButton: {
        backgroundColor: 'rgba(39,82,174,0.81)',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ecf0f1',
        padding: 20,
    },
    modalTitle: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 28,
        marginBottom: 30,
        color: '#2c3e50',
    },
    lyricsScrollView: {
        textAlign: 'center',

    },
    lyricsText: {
        color: '#2c3e50',
        fontSize: 16,
    },
    lyricsInput: {
        height: 400,
        width:300,
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
        backgroundColor: 'rgba(231,76,60,0.72)',
    },
    clearButton: {
        marginLeft: 10,
    },


});

export default Home;
