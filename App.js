import { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, ScrollView } from 'react-native';
import {
  PaperProvider,
  Card,
  Text,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function TelaFilmes({ navigation }) {
  const [filmes, setFilmes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function buscarFilmes() {
    setCarregando(true);
    setErro('');

    try {
      const resposta = await fetch(
        'https://www.omdbapi.com/?s=spider%20man&apikey=1cd66749'
      );

      if (!resposta.ok) {
        setErro('Não foi possível acessar a API.');
        return;
      }

      const dados = await resposta.json();

      if (dados.Response === 'True') {
        const listaFilmes = dados.Search.filter(
          filme => filme.Type === 'movie'
        );

        setFilmes(listaFilmes);
      } else {
        setErro(dados.Error || 'Não foi possível buscar os filmes.');
      }
    } catch (error) {
      setErro('Erro de conexão. Confira sua internet.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    buscarFilmes();
  }, []);

  if (carregando) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" color="#C2185B" />
        <Text style={styles.mensagem}>Carregando filmes...</Text>
      </View>
    );
  }

  if (erro !== '') {
    return (
      <View style={styles.centralizado}>
        <Text style={styles.mensagem}>{erro}</Text>

        <Button
          mode="contained"
          buttonColor="#C2185B"
          onPress={buscarFilmes}
        >
          Tentar novamente
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filmes}
        keyExtractor={item => item.imdbID}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <Text>Nenhum filme encontrado.</Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            {item.Poster !== 'N/A' && (
              <Card.Cover source={{ uri: item.Poster }} />
            )}

            <Card.Content>
              <Text style={styles.titulo}>{item.Title}</Text>
              <Text style={styles.texto}>Ano: {item.Year}</Text>
            </Card.Content>

            <Card.Actions>
              <Button
                textColor="#C2185B"
                onPress={() =>
                  navigation.navigate('Detalhes', { filme: item })
                }
              >
                Ver detalhes
              </Button>
            </Card.Actions>
          </Card>
        )}
      />
    </View>
  );
}

function TelaDetalhes({ route, navigation }) {
  const filme = route.params.filme;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.lista}
    >
      <Card style={styles.card}>
        {filme.Poster !== 'N/A' && (
          <Card.Cover
            source={{ uri: filme.Poster }}
            style={styles.poster}
            resizeMode="contain"
          />
        )}

        <Card.Content>
          <Text style={styles.titulo}>{filme.Title}</Text>
          <Text style={styles.texto}>Ano: {filme.Year}</Text>
          <Text style={styles.texto}>Tipo: Filme</Text>
          <Text style={styles.texto}>Código IMDb: {filme.imdbID}</Text>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        buttonColor="#C2185B"
        onPress={() => navigation.goBack()}
      >
        Voltar para a lista
      </Button>
    </ScrollView>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Filmes"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#C2185B',
            },
            headerTintColor: '#FFFFFF',
          }}
        >
          <Stack.Screen
            name="Filmes"
            component={TelaFilmes}
            options={{ title: 'Lista de filmes' }}
          />

          <Stack.Screen
            name="Detalhes"
            component={TelaDetalhes}
            options={{ title: 'Detalhes do filme' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  centralizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF0F5',
  },
  lista: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#880E4F',
    marginTop: 16,
    marginBottom: 8,
  },
  texto: {
    fontSize: 16,
    marginBottom: 8,
  },
  mensagem: {
    textAlign: 'center',
    marginVertical: 16,
  },
  poster: {
    height: 350,
    backgroundColor: '#FCE4EC',
  },
});