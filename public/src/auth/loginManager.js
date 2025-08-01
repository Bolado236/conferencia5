const userData = await usuarioManager.login(usuarioInput, senhaInput, lojaSelecionada);
sessionStorage.setItem('user', JSON.stringify(userData));
