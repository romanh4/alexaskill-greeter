#include <eosiolib/eosio.hpp>
#include <eosiolib/print.hpp>

using namespace eosio;

class hello : public contract
{
public:
  using contract::contract;

  [[eosio::action]] 
  void hi(name user) {
    print("Willkommen", user);
  }
};

EOSIO_DISPATCH(hello, (hi))